import type { Api } from "@codemod.com/workflow";

export async function workflow({ files }: Api) {
  const context = await files("**/*.{ts,js}").jsFam();
  // Napi Configuration for memoization node matching
  const memoizePatternConfig = {
    rule: {
      pattern: {
        context: "({$$$PROPERTIES})",
        selector: "object",
      },
      inside: {
        kind: "arguments",
        inside: {
          kind: "call_expression",
          has: {
            stopBy: "end",
            any: [
              {
                regex: "^createSelectorCreator$",
              },
              {
                regex: "^createSelector$",
              },
            ],
          },
        },
      },
    },
  };

  const propertyKeys = ["memoize", "argsMemoize"];

  // First replacement pass
  await context
    .astGrep(memoizePatternConfig)
    .replace(({ getMultipleMatches, getNode }) => {
      const node = getNode();
      const properties = getMultipleMatches("PROPERTIES").filter(
        (property) => property.text() !== ",",
      );

      const updatedProperties: string[] = [];
      propertyKeys.forEach((key) => {
        const hasEqualityCheck = node.find({
          rule: {
            pattern: {
              context: "({$$$_})",
              selector: "object",
            },
            has: {
              pattern: {
                context: `{ ${key}Options: $_ }`,
                selector: "pair",
              },
              has: {
                stopBy: "end",
                pattern: {
                  context: "{ equalityCheck: $_ }",
                  selector: "pair",
                },
              },
            },
          },
        });

        // Remove existing property keys if found
        for (let i = properties.length - 1; i >= 0; i--) {
          const matchingProperty = properties[i]?.find({
            rule: {
              kind: "property_identifier",
              regex: `^${key}$`,
            },
          });
          if (matchingProperty) {
            properties.splice(i, 1);
            break;
          }
        }

        if (hasEqualityCheck) {
          updatedProperties.push(`${key}: lruMemoize`);
        }
      });

      const newProperties = updatedProperties.concat(
        properties.map((prop) => prop.text()),
      );
      const updatedNode = node.commitEdits([
        node.replace(`{ ${newProperties.join(",\n")} }`),
      ]);

      return updatedNode;
    });

  // Second replacement pass for options
  await context.astGrep(memoizePatternConfig).replace(
    ({ getNode, getMultipleMatches }) => {
      const node = getNode();
      const properties = getMultipleMatches("PROPERTIES").filter((property) =>
        property.text() !== ","
      );

      const updatedOptions: string[] = [];
      propertyKeys.forEach((key) => {
        const optionNode = node.find({
          rule: {
            pattern: {
              context: `{ ${key}Options: {$$$_} }`,
              selector: "pair",
            },
            not: {
              has: {
                kind: "object",
                has: {
                  pattern: {
                    context: "{ equalityCheck: $_ }",
                    selector: "pair",
                  },
                },
              },
            },
          },
        });

        if (optionNode) {
          const resultEqualityCheckNode = optionNode.find({
            rule: {
              has: {
                stopBy: "end",
                pattern: {
                  context: "{ resultEqualityCheck: $CHECKFUNC }",
                  selector: "pair",
                },
              },
            },
          });

          // Remove existing property keys if found
          for (let i = properties.length - 1; i >= 0; i--) {
            const matchedProperty = properties[i]?.find({
              rule: {
                kind: "property_identifier",
                any: [
                  { regex: `^${key}$` },
                  { regex: `^${key}Options$` },
                ],
              },
            });
            if (matchedProperty) {
              properties.splice(i, 1);
            }
          }

          if (resultEqualityCheckNode) {
            updatedOptions.push(
              `${key}Options: { resultEqualityCheck: ${
                resultEqualityCheckNode.getMatch("CHECKFUNC")?.text()
              } }`,
            );
          }
        }
      });

      const newProperties = updatedOptions.concat(
        properties.map((prop) => prop.text()),
      );
      const edit = node.replace(`{${newProperties.join(",\n")}}`);
      const updatedNode = node.commitEdits([edit]);
      return updatedNode;
    },
  );
}

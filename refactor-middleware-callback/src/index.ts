import type { Api } from "@codemod.com/workflow";

export async function workflow({ files }: Api) {
  const context = await files("**/*.{ts,js}").jsFam();
  ["Javascript", "Typescript", "Tsx"].forEach(async (lang) => {
    await context.astGrep({
      id: "callback-enhancers",
      language: lang,
      utils: {
        "is-spread": {
          kind: "spread_element",
          has: {
            stopBy: "end",
            kind: "call_expression",
            has: {
              any: [
                {
                  regex: "^getDefaultMiddleware$",
                },
                {
                  regex: "^getDefaultEnhancers$",
                },
              ],
            },
            pattern: "$CALL",
          },
        },
      },
      rewriters: [
        {
          id: "star",
          rule: {
            matches: "is-spread",
          },
          fix: {
            template: "",
            expandEnd: {
              regex: ",",
            },
          },
        },
        {
          id: "inlineFunc",
          rule: {
            any: [
              {
                pattern: "[$$$ELEMENTS]",
              },
              {
                pattern: "Array.of($$$ELEMENTS)",
              },
              {
                pattern: "new Tuple($$$ELEMENTS)",
              },
            ],
            has: {
              matches: "is-spread",
            },
          },
          transform: {
            NEWARR: {
              rewrite: {
                rewriters: ["star"],
                source: "$$$ELEMENTS",
              },
            },
          },
          fix: "$CALL.concat([$NEWARR])",
        },
        {
          id: "array-to-Tuple",
          language: "typescript",
          rule: {
            any: [
              {
                pattern: "[$$$ELEMENTS]",
              },
              {
                pattern: "Array.of($$$ELEMENTS)",
              },
            ],
          },
          fix: "new Tuple($$$ELEMENTS)",
        },
      ],
      constraints: {
        KEY: {
          any: [
            {
              regex: "middleware",
            },
            {
              regex: "enhancers",
            },
          ],
        },
        VALUE: {
          any: [
            {
              pattern: "new Tuple($$$_)",
            },
            {
              kind: "member_expression",
            },
            {
              kind: "call_expression",
            },
            {
              kind: "array",
            },
            {
              kind: "identifier",
            },
          ],
        },
      },
      rule: {
        pattern: {
          context: "{ $KEY: $VALUE }",
          selector: "pair",
        },
        inside: {
          stopBy: "end",
          kind: "arguments",
          inside: {
            kind: "call_expression",
            has: {
              kind: "identifier",
              regex: "^configureStore$",
            },
          },
        },
      },
      transform: {
        CALLBACK: {
          convert: {
            source: "$KEY",
            toCase: "capitalize",
          },
        },
        CONTAINER: {
          rewrite: {
            rewriters: ["inlineFunc", "array-to-Tuple"],
            source: "$VALUE",
          },
        },
      },
      fix: "$KEY: (getDefault$CALLBACK) => $CONTAINER",
    });
  });
  await context
    .astGrep({
      rule: {
        kind: "program",
        has: {
          stopBy: "end",
          pattern: "new Tuple($$$_)",
        },
        not: {
          has: {
            stopBy: "end",
            kind: "identifier",
            regex: "^Tuple$",
            inside: {
              stopBy: "end",
              kind: "import_clause",
              inside: {
                kind: "import_statement",
                has: {
                  stopBy: "end",
                  regex: "^@reduxjs/toolkit$",
                },
              },
            },
          },
        },
      },
    })
    .replace(({ getNode }) => {
      const node = getNode();
      const isRTKImported = getNode().find({
        rule: {
          pattern: {
            context: "import {$$$ELEMENTS} from '@reduxjs/toolkit'",
            selector: "import_clause",
            strictness: "relaxed",
          },
        },
      });
      if (isRTKImported) {
        const elements = isRTKImported
          .getMultipleMatches("ELEMENTS")
          .map((el) => el.text())
          .filter((el) => el != ",");
        elements.push("Tuple");
        const edit = isRTKImported.replace(`{ ${elements.join(", ")} }`);
        const newNode = node.commitEdits([edit]);
        return newNode;
      } else {
        const newNode = `import { Tuple } from "@reduxjs/toolkit";\n${node.text()}`;
        return newNode;
      }
    });
}

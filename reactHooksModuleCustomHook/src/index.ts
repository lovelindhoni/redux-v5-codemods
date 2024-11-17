import type { Api } from "@codemod.com/workflow";
export async function workflow({ files }: Api) {
  await files("**/*.{ts,js}")
    .jsFam()
    .astGrep(
      {
        rule: {
          pattern: {
            context: "({ $$$PAIRS })",
            selector: "object",
          },
          inside: {
            kind: "arguments",
            inside: {
              kind: "call_expression",
              has: {
                kind: "identifier",
                regex: "^reactHooksModule$",
              },
            },
          },
          not: {
            has: {
              kind: "pair",
              has: {
                kind: "property_identifier",
                regex: "^hooks$",
              },
            },
          },
        },
      },
    )
    .replace(({ getMultipleMatches }) => {
      const pairs = getMultipleMatches("PAIRS")
        .map((pair) => pair.text().trim())
        .filter((pair) => pair != ",");
      const regex = /^(useDispatch|useSelector|useStore)/;
      const hooks = pairs.filter((pair) => regex.test(pair));
      if (!hooks.length) return;
      const hooksObject = `hooks: {\n${hooks.join(",\n")}\n}`;
      const otherPairs = pairs.filter((pair) => !regex.test(pair));
      otherPairs.unshift(hooksObject);
      const result = `{\n${otherPairs}\n}`;
      return result;
    });
}

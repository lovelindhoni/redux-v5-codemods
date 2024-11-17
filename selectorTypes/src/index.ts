import type { Api } from "@codemod.com/workflow";

export async function workflow({ files }: Api) {
  const context = await files("**/*.{ts,js}").jsFam();
  await context.astGrep({
    id: "fix-types",
    language: "typescript",
    rewriters: [
      {
        id: "parametricSelector",
        language: "typescript",
        rule: {
          regex: "^ParametricSelector$",
        },
        fix: "Selector",
      },
      {
        id: "outputParametricSelector",
        language: "typescript",
        rule: {
          regex: "^OutputParametricSelector$",
        },
        fix: "OutputSelector",
      },
    ],
    rule: {
      kind: "type_identifier",
      pattern: "$INTERFACE",
      not: {
        inside: {
          kind: "class_declaration",
        },
      },
    },
    transform: {
      NEW_INTERFACE: {
        rewrite: {
          source: "$INTERFACE",
          rewriters: [
            "parametricSelector",
            "outputParametricSelector",
          ],
        },
      },
    },
    fix: "$NEW_INTERFACE",
  });
  await context.astGrep({
    id: "fix-imports",
    language: "typescript",
    rewriters: [
      {
        id: "fix-parametricSelector",
        language: "typescript",
        rule: {
          regex: "^ParametricSelector$",
        },
        fix: "Selector",
      },
      {
        id: "fix-outputParametricSelector",
        language: "typescript",
        rule: {
          regex: "^OutputParametricSelector$",
        },
        fix: "OutputSelector",
      },
    ],
    rule: {
      kind: "identifier",
      pattern: "$IMPORT",
      inside: {
        stopBy: "end",
        kind: "import_statement",
        has: {
          stopBy: "end",
          any: [
            {
              regex: "^reselect$",
            },
            {
              regex: "^@reduxjs/toolkit$",
            },
          ],
        },
      },
    },
    transform: {
      NEW_IMPORT: {
        rewrite: {
          rewriters: [
            "fix-outputParametricSelector",
            "fix-parametricSelector",
          ],
          source: "$IMPORT",
        },
      },
    },
    fix: "$NEW_IMPORT",
  });
}
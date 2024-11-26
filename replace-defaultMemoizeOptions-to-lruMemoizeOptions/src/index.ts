import type { Api } from "@codemod.com/workflow";

export async function workflow({ files }: Api) {
  const context = await files("**/*.{ts,js,tsx}").jsFam();
  const langs = ["Javascript", "Typescript", "Tsx"];
  langs.forEach(async (lang) => {
    await context.astGrep({
      id: "fix-type",
      language: lang,
      rule: {
        kind: "type_identifier",
        regex: "^DefaultMemoizeOptions$",
        not: {
          inside: {
            kind: "class_declaration",
          },
        },
      },
      fix: "LruMemoizeOptions",
    });
  });
  langs.forEach(async (lang) => {
    await context.astGrep({
      id: "update-import",
      language: lang,
      rule: {
        kind: "identifier",
        regex: "^DefaultMemoizeOptions$",
        inside: {
          stopBy: "end",
          kind: "import_statement",
          has: {
            stopBy: "end",
            regex: "^reselect$",
          },
        },
      },
      fix: "LruMemoizeOptions",
    });
  });
}

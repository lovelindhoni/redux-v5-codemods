import type { Api } from ".pnpm/@codemod.com+workflow@0.0.31/node_modules/@codemod.com/workflow/dist/index.js";

export async function workflow({ files }: Api) {
  const context = await files("**/*.{ts,js}").jsFam();
  await context.astGrep({
    id: "fix-type",
    language: "typescript",
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
  await context.astGrep({
    id: "update-import",
    language: "typescript",
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
}

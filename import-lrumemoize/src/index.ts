import type { Api } from "@codemod.com/workflow";

export async function workflow({ files }: Api) {
  const context = await files("**/*.ts").jsFam();
  // AST grep configuration for files missing the `lruMemoize` import
  await context
    .astGrep({
      rule: {
        kind: "program",
        pattern: "$FULL_FILE",
        has: {
          stopBy: "end",
          kind: "identifier",
          regex: "^lruMemoize$",
        },
        not: {
          has: {
            kind: "import_statement",
            all: [
              {
                has: {
                  kind: "import_clause",
                  has: {
                    stopBy: "end",
                    kind: "identifier",
                    regex: "^lruMemoize$",
                  },
                },
              },
            ],
          },
        },
      },
    })
    .replace(({ getNode, getMatch }) => {
      // Get the full file text and the current AST node
      const fullFileText = getMatch("FULL_FILE")?.text();
      const node = getNode();
      const importSource = "@reduxjs/toolkit";
      const isDefaultMemoizeImport = node.find({
        rule: {
          kind: "identifier",
          regex: "^defaultMemoize$",
          inside: {
            stopBy: "end",
            kind: "import_clause",
            inside: {
              kind: "import_statement",
            },
          },
        },
      });
      if (isDefaultMemoizeImport) {
        const edit = isDefaultMemoizeImport.replace("lruMemoize");
        const commitedNode = node.commitEdits([edit]);
        return commitedNode;
      }

      let newImportStatement = `import { lruMemoize } from "${importSource}"`;

      // Check if `lruMemoize` needs to be added to an existing import statement
      const existingImportNode = node.find({
        rule: {
          pattern: {
            context: `import { $$$IMPORTS } from '${importSource}'`,
            selector: "import_statement",
            strictness: "relaxed",
          },
        },
      });

      if (existingImportNode) {
        // Extract existing imports and add `lruMemoize`
        const existingImports = existingImportNode
          .getMultipleMatches("IMPORTS")
          .map((importNode) => importNode.text())
          .filter((importText) => importText !== ",");

        existingImports.unshift("lruMemoize"); // Add `lruMemoize` at the beginning
        newImportStatement = `import { ${
          existingImports.join(", ")
        } } from "${importSource}"`;

        // Replace the existing import statement with the updated one
        const updatedNode = existingImportNode.replace(newImportStatement);
        const committedNode = node.commitEdits([updatedNode]);
        return committedNode;
      } else {
        // If no existing import statement, add a new one at the start of the file
        return `${newImportStatement}\n${fullFileText}`;
      }
    });
}

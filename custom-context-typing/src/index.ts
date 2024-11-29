import type { Api } from "@codemod.com/workflow";

export async function workflow({ files }: Api) {
  const context = await files("**/*.ts").jsFam();
  for (const lang of ["Typescript", "Tsx"]) {
    await context.astGrep({
      id: "custom-context-typing",
      language: lang,
      rewriters: [
        {
          id: "react-namespace",
          rule: {
            pattern: "React.createContext<ReactReduxContextValue>(null as any)",
          },
          fix: "React.createContext<ReactReduxContextValue | null>(null)",
        },
        {
          id: "standalone",
          rule: {
            pattern: "createContext<ReactReduxContextValue>(null as any)",
          },
          fix: "createContext<ReactReduxContextValue | null>(null)",
        },
      ],
      rule: {
        kind: "call_expression",
        pattern: "$CALL",
      },
      transform: {
        NEW_SIGNATURE: {
          rewrite: {
            rewriters: ["react-namespace", "standalone"],
            source: "$CALL",
          },
        },
      },
      fix: "$NEW_SIGNATURE",
    });
  }
}


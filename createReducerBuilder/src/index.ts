import type { Api } from "@codemod.com/workflow";

export async function workflow({ files }: Api) {
  const context = await files("**/*.{ts,js}").jsFam();
  ["Javascript", "Typescript"].forEach(
    async (lang) =>
      await context.astGrep({
        id: "createReducerBuilderCase",
        language: lang,
        rewriters: [
          {
            id: "methods",
            rule: {
              pattern: {
                context: "{$NAME($$$PARAMS){$BODY}}",
                selector: "method_definition",
              },
            },
            transform: {
              NEW_NAME: {
                replace: {
                  by: "$1",
                  replace: "\\[(.+?)\\]",
                  source: "$NAME",
                },
              },
            },
            fix: "builder.addCase($NEW_NAME, ($$$PARAMS) => {\n$BODY\n})",
          },
          {
            id: "pairs",
            rule: {
              pattern: {
                context: "{$KEY : $VAL}",
                selector: "pair",
              },
            },
            transform: {
              NEW_KEY: {
                replace: {
                  by: "$1",
                  replace: "\\[(.+?)\\]",
                  source: "$KEY",
                },
              },
            },
            fix: "builder.addCase($NEW_KEY, $VAL)",
          },
        ],
        rule: {
          pattern: {
            context: "createReducer($INIT, {$$$REDUCERS})",
            selector: "call_expression",
          },
        },
        transform: {
          EXTRAREDUCERS: {
            rewrite: {
              rewriters: ["pairs", "methods"],
              source: "$$$REDUCERS",
              joinBy: ";\n",
            },
          },
        },
        fix: "createReducer($INIT, (builder) => {\n$EXTRAREDUCERS\n})",
      }),
  );
}

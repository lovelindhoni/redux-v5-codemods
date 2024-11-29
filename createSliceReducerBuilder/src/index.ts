import type { Api } from "@codemod.com/workflow";
export async function workflow({ files }: Api) {
  const context = await files("**/*.{ts,js}").jsFam();
  for (const lang of ["Javascript", "Typescript", "Tsx"]) {
    await context.astGrep({
      id: "createSliceReducerBuilderCase",
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
          fix: "$NAME: create.reducer(($$$PARAMS) => {\n$BODY\n})",
        },
        {
          id: "prepReducerMethods",
          rule: {
            pattern: {
              context: "{ $KEY: { $$$_ }}",
              selector: "pair",
            },
            has: {
              kind: "object",
              all: [
                {
                  has: {
                    pattern: {
                      context: "{prepare($$$PREPAREPARAMS){$PREPAREBODY}}",
                      selector: "method_definition",
                    },
                  },
                },
                {
                  has: {
                    pattern: {
                      context: "{reducer($$$REDUCERPARAMS){$REDUCERBODY}}",
                      selector: "method_definition",
                    },
                  },
                },
              ],
            },
          },
          fix: "$KEY: create.preparedReducer(($$$PREPAREPARAMS) => {\n$PREPAREBODY\n}, ($$$REDUCERPARAMS) => {\n$REDUCERBODY\n})",
        },
        {
          id: "prepReducerProperty",
          rule: {
            pattern: {
              context:
                "{ $KEY: { prepare : $PREPAREFUNC, reducer: $REDUCERFUNC  } }",
              selector: "pair",
            },
          },
          fix: "$KEY: create.preparedReducer($PREPAREFUNC, $REDUCERFUNC)",
        },
        {
          id: "pairs",
          rule: {
            pattern: {
              context: "{$KEY : $VAL}",
              selector: "pair",
            },
          },
          fix: "$KEY: create.reducer($VAL)",
        },
      ],
      rule: {
        pattern: {
          context: "{ reducers: {$$$REDUCERS} }",
          selector: "pair",
        },
        inside: {
          stopBy: "end",
          kind: "call_expression",
          has: {
            kind: "identifier",
            regex: "^createSlice$",
          },
        },
      },
      transform: {
        EXTRAREDUCERS: {
          rewrite: {
            rewriters: [
              "prepReducerMethods",
              "prepReducerProperty",
              "pairs",
              "methods",
            ],
            source: "$$$REDUCERS",
          },
        },
      },
      fix: "reducers: (create) => ({\n$EXTRAREDUCERS\n})",
    });
  }
}

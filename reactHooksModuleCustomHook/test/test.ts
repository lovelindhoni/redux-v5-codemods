const customCreateApi = buildCreateApi(
  coreModule(),
  reactHooksModule({
    hooks: {
      useDispatch: createDispatchHook(MyContext),
      useSelector: createSelectorHook(MyContext),
      useStore: createStoreHook(MyContext),
    },
    name: "Hi",
  }),
);

// now
const customCreateApi = buildCreateApi(
  coreModule(),
  reactHooksModule({
    yoyo: {
      useDispatch: createDispatchHook(MyContext),
      useSelector: createSelectorHook(MyContext),
      useStore: createStoreHook(MyContext),
    },
  }),
);

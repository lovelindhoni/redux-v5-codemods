const customCreateApi = buildCreateApi(
  coreModule(),
  reactHooksModule({
    useDispatch: createDispatchHook(MyContext),
    useSelector: createSelectorHook(MyContext),
    useStore: createStoreHook(MyContext)
  })
)
const customCreateApi2 = buildCreateApi(
  coreModule(),
  reactHooksModule({
    useDispatch: createDispatchHook(MyContext),
    useSelector: createSelectorHook(MyContext),
    useStore: createStoreHook(MyContext)
  })
)

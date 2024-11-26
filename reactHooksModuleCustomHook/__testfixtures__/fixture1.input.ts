const customCreateApi = buildCreateApi(
  coreModule(),
  reactHooksModule({
    useDispatch: createDispatchHook(MyContext),
    useSelector: createSelectorHook(MyContext),
    useStore: createStoreHook(MyContext)
  })
)

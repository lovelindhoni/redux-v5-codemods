const createSelectorShallowEqual = createSelectorCreator({
  memoize: lruMemoize,
  memoizeOptions: {
    resultEqualityCheck: shallowEqual,
    maxSize: 10,
  },
  argsMemoize: lruMemoize,
  argsMemoizeOptions: {
    maxSize: 10,
  },
});

const createSelectorShallowEqual = createSelectorCreator({
  memoize: lruMemoize,
  memoizeOptions: {
    equalityCheck: shallowEqual,
    resultEqualityCheck: shallowEqual,
    maxSize: 10,
  },
  argsMemoize: lruMemoize,
  argsMemoizeOptions: {
    equalityCheck: shallowEqual,
    maxSize: 10,
  },
});

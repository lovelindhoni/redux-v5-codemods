import { lruMemoize } from "@reduxjs/toolkit";
const createSelectorShallowEqual = createSelectorCreator({
  argsMemoizeOptions: { resultEqualityCheck: shallowEqual },
  memoize: lruMemoize,
  memoizeOptions: {
    resultEqualityCheck: shallowEqual,
    equalityCheck: dd,
    maxSize: 10,
  },
});

const createSelectorShallowEqual = createSelectorCreator({
  argsMemoizeOptions: { resultEqualityCheck: shallowEqual },
  memoize: lruMemoize,
  memoizeOptions: {
    resultEqualityCheck: shallowEqual,
    equalityCheck: dd,
    maxSize: 10,
  },
});

const selectTodoIds = createSelector(
  [(state: RootState) => state.todos],
  (todos) => todos.map((todo) => todo.id),
  {
    memoize: lruMemoize,
    argsMemoize: lruMemoize,
    memoizeOptions: {
      equalityCheck: shallowEqual,
    },
    argsMemoizeOptions: {
      equalityCheck: shallowEqual,
      resultEqualityCheck: shallowEqual,
      maxSize: 10,
    },
  },
);

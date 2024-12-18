const todoSlice = createSlice({
  name: 'todo',
  initialState: todoInitialState,
  reducers: {
    deleteTodo: todoAdapter.removeOne
  },
  extraReducers: {
    [incrementAsync.pending]: (
      state: TodoSliceState,
      action: PayloadAction<string>
    ) => {
      // stuff
    },
    [incrementAsync.rejected]: todoAdapter.removeAll,
    [incrementAsync.fulfilled](
      state: TodoSliceState,
      action: PayloadAction<string>) {
      // stuff
    },
    todoAdded: todoAdapter.addOne,

    [todoAdded1a]: (state: TodoSliceState, action: PayloadAction<string>) => {
      // stuff
    },
    [todoAdded1b]: (state: TodoSliceState, action: PayloadAction<string>) => action.payload,
    [todoAdded1c + 'test']: (state:TodoSliceState, action: PayloadAction<string>) => {
      // stuff
    },
    [todoAdded1d](state: TodoSliceState, action: PayloadAction<string>) {
      // stuff
    },
    [todoAdded1e]: function(state: TodoSliceState, action: PayloadAction<string>) {
      // stuff
    },
    todoAdded1f: (state: TodoSliceState, action: PayloadAction<string>) => {
      //stuff
    },
    [todoAdded1g]: addOne,
    todoAdded1h: todoAdapter.addOne,
  }
})

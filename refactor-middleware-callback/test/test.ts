import { Tuple } from "@reduxjs/toolkit";
const typel = getDefaultMiddleware();

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => {
    return new Tuple(1, 2, 3);
  },
});

const store2 = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => {
    return new Tuple(hi, ho);
  },
  enhancers: (getDefaultEnhancers) => {
    return new Tuple(hi, ho);
  },
});

const store2 = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => {
    return new Tuple(hiii, hooo);
  },
});

const store2 = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => {
    return myarray;
  },
});

const store2 = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => {
    return myobj.array;
  },
});

const store2 = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => {
    return getDeeef();
  },
});

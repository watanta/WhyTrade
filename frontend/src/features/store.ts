import { configureStore } from '@reduxjs/toolkit'

import authReducer from './auth/authSlice';
import tradeReducer from './trades/tradeSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        trades: tradeReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

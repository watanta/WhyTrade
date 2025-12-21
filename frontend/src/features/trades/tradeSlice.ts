import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import tradeService, { Trade, TradeCreate, TradeUpdate } from '../../services/tradeService';

interface TradeState {
    trades: Trade[];
    isLoading: boolean;
    error: string | null;
}

const initialState: TradeState = {
    trades: [],
    isLoading: false,
    error: null,
};

export const fetchTrades = createAsyncThunk(
    'trades/fetchTrades',
    async (_, { rejectWithValue }) => {
        try {
            return await tradeService.getTrades();
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to fetch trades');
        }
    }
);

export const addTrade = createAsyncThunk(
    'trades/addTrade',
    async (tradeData: TradeCreate, { rejectWithValue }) => {
        try {
            return await tradeService.createTrade(tradeData);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to add trade');
        }
    }
);

export const editTrade = createAsyncThunk(
    'trades/editTrade',
    async ({ id, data }: { id: string; data: TradeUpdate }, { rejectWithValue }) => {
        try {
            return await tradeService.updateTrade(id, data);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to update trade');
        }
    }
);

export const removeTrade = createAsyncThunk(
    'trades/removeTrade',
    async (id: string, { rejectWithValue }) => {
        try {
            await tradeService.deleteTrade(id);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to delete trade');
        }
    }
);

const tradeSlice = createSlice({
    name: 'trades',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTrades.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTrades.fulfilled, (state, action: PayloadAction<Trade[]>) => {
                state.isLoading = false;
                state.trades = action.payload;
            })
            .addCase(fetchTrades.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(addTrade.fulfilled, (state, action: PayloadAction<Trade>) => {
                state.trades.unshift(action.payload);
            })
            .addCase(editTrade.fulfilled, (state, action: PayloadAction<Trade>) => {
                const index = state.trades.findIndex((t) => t.id === action.payload.id);
                if (index !== -1) {
                    state.trades[index] = action.payload;
                }
            })
            .addCase(removeTrade.fulfilled, (state, action: PayloadAction<string>) => {
                state.trades = state.trades.filter((t) => t.id !== action.payload);
            });
    },
});

export default tradeSlice.reducer;

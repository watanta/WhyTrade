import apiClient from './api';

export interface Trade {
    id: string;
    user_id: string;
    ticker_symbol: string;
    trade_type: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    total_amount: number;
    executed_at: string;
    status: 'OPEN' | 'CLOSED';
    profit_loss: number | null;
    created_at: string;
    updated_at: string | null;
}

export interface TradeCreate {
    ticker_symbol: string;
    trade_type: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    total_amount: number;
    executed_at?: string;
    status?: 'OPEN' | 'CLOSED';
}

export interface TradeUpdate {
    ticker_symbol?: string;
    trade_type?: 'BUY' | 'SELL';
    quantity?: number;
    price?: number;
    total_amount?: number;
    executed_at?: string;
    status?: 'OPEN' | 'CLOSED';
    profit_loss?: number;
}

const tradeService = {
    getTrades: async () => {
        const response = await apiClient.get<Trade[]>('/trades/');
        return response.data;
    },
    getTrade: async (id: string) => {
        const response = await apiClient.get<Trade>(`/trades/${id}`);
        return response.data;
    },
    createTrade: async (tradeData: TradeCreate) => {
        const response = await apiClient.post<Trade>('/trades/', tradeData);
        return response.data;
    },
    updateTrade: async (id: string, tradeData: TradeUpdate) => {
        const response = await apiClient.put<Trade>(`/trades/${id}`, tradeData);
        return response.data;
    },
    deleteTrade: async (id: string) => {
        const response = await apiClient.delete<Trade>(`/trades/${id}`);
        return response.data;
    },
};

export default tradeService;

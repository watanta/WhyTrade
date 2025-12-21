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
    profit_loss?: number;
    market_env?: string;
    technical_analysis?: string;
    fundamental_analysis?: string;
    risk_reward_ratio?: number;
    confidence_level?: number;
    rationale?: string;
    related_trade_id?: string;
    // Enhanced entry rationale fields
    entry_trigger?: string;
    target_price?: number;
    stop_loss?: number;
    holding_period?: string;
    position_sizing_rationale?: string;
    competitor_analysis?: string;
    catalyst?: string;
    created_at: string;
    updated_at: string;
}

export interface Position {
    ticker_symbol: string;
    total_quantity: number;
    average_price: number;
    total_amount: number;
    trades: Trade[];
}

export interface TradeCreate {
    ticker_symbol: string;
    trade_type: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    total_amount: number;
    executed_at?: string;
    status?: 'OPEN' | 'CLOSED';
    // Rationale fields
    market_env?: string;
    technical_analysis?: string;
    fundamental_analysis?: string;
    risk_reward_ratio?: number;
    confidence_level?: number;
    rationale?: string;
    // Enhanced entry rationale fields
    entry_trigger?: string;
    target_price?: number;
    stop_loss?: number;
    holding_period?: string;
    position_sizing_rationale?: string;
    competitor_analysis?: string;
    catalyst?: string;
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
    // Rationale fields
    market_env?: string;
    technical_analysis?: string;
    fundamental_analysis?: string;
    risk_reward_ratio?: number;
    confidence_level?: number;
    rationale?: string;
    // Enhanced entry rationale fields
    entry_trigger?: string;
    target_price?: number;
    stop_loss?: number;
    holding_period?: string;
    position_sizing_rationale?: string;
    competitor_analysis?: string;
    catalyst?: string;
}

export interface TradeClose {
    closing_price: number;
    closed_at?: string;
    rationale?: string;
}

export interface Reflection {
    id: string;
    trade_id: string;
    what_went_well?: string;
    what_went_wrong?: string;
    lessons_learned?: string;
    action_items?: string;
    satisfaction_rating?: number;
    created_at: string;
    updated_at?: string;
}

export interface ReflectionCreate {
    what_went_well?: string;
    what_went_wrong?: string;
    lessons_learned?: string;
    action_items?: string;
    satisfaction_rating?: number;
}

export interface ReflectionUpdate {
    what_went_well?: string;
    what_went_wrong?: string;
    lessons_learned?: string;
    action_items?: string;
    satisfaction_rating?: number;
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
    getPositions: async (includeClosed: boolean = false): Promise<Position[]> => {
        const response = await apiClient.get<Position[]>('/trades/positions', {
            params: { include_closed: includeClosed }
        });
        return response.data;
    },
    closeTrade: async (id: string, closeData: TradeClose) => {
        const response = await apiClient.post<Trade>(`/trades/${id}/close`, closeData);
        return response.data;
    },

    getReflection: async (tradeId: string): Promise<Reflection> => {
        const response = await apiClient.get(`/reflections/${tradeId}/reflection`);
        return response.data;
    },

    createReflection: async (tradeId: string, data: ReflectionCreate): Promise<Reflection> => {
        const response = await apiClient.post(`/reflections/${tradeId}/reflection`, data);
        return response.data;
    },

    updateReflection: async (tradeId: string, data: ReflectionUpdate): Promise<Reflection> => {
        const response = await apiClient.put(`/reflections/${tradeId}/reflection`, data);
        return response.data;
    },
};

export default tradeService;

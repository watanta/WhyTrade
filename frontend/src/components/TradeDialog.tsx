import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
} from '@mui/material';
import tradeService, { Trade, TradeCreate } from '../services/tradeService';

interface TradeDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: Trade | null;
}

const TradeDialog: React.FC<TradeDialogProps> = ({ open, onClose, onSubmit, initialData }) => {
    const { control, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: {
            ticker_symbol: '',
            trade_type: 'BUY',
            quantity: 0,
            price: 0,
            total_amount: 0,
            executed_at: new Date().toISOString().slice(0, 16),
            market_env: '',
            technical_analysis: '',
            fundamental_analysis: '',
            risk_reward_ratio: 1,
            confidence_level: 3,
            rationale: '',
            entry_trigger: '',
            target_price: 0,
            stop_loss: 0,
            holding_period: '',
            position_sizing_rationale: '',
            competitor_analysis: '',
            catalyst: '',
        },
    });

    const quantity = watch('quantity');
    const price = watch('price');
    const targetPrice = watch('target_price');
    const stopLoss = watch('stop_loss');
    const tickerSymbol = watch('ticker_symbol');

    const [isFetchingPrice, setIsFetchingPrice] = useState(false);
    const [priceSourceInfo, setPriceSourceInfo] = useState('');

    useEffect(() => {
        if (!tickerSymbol || tickerSymbol.length < 4) {
            setPriceSourceInfo('');
            return;
        }

        // Skip fetching if it matches initial data on load (optional, but good for UX)
        if (initialData && initialData.ticker_symbol === tickerSymbol && price > 0) {
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsFetchingPrice(true);
            setPriceSourceInfo('株価取得中...');
            try {
                const data = await tradeService.getStockPrice(tickerSymbol);
                setValue('price', data.price);
                const sourceText = data.source === 'last_price' ? '現在値' : '終値';
                setPriceSourceInfo(`${sourceText}: ${data.price} (${new Date(data.timestamp).toLocaleTimeString()})`);
            } catch (error) {
                console.error("Failed to fetch price", error);
                setPriceSourceInfo('株価取得失敗: コードを確認してください');
            } finally {
                setIsFetchingPrice(false);
            }
        }, 1000); // 1 second debounce

        return () => clearTimeout(timeoutId);
    }, [tickerSymbol, setValue, initialData]);

    useEffect(() => {
        setValue('total_amount', (quantity || 0) * (price || 0));
    }, [quantity, price, setValue]);

    // Auto-calculate risk-reward ratio
    useEffect(() => {
        const entryPrice = Number(price) || 0;
        const target = Number(targetPrice) || 0;
        const stop = Number(stopLoss) || 0;

        if (entryPrice > 0 && target > 0 && stop > 0) {
            const potentialProfit = Math.abs(target - entryPrice);
            const potentialLoss = Math.abs(entryPrice - stop);

            if (potentialLoss > 0) {
                const ratio = potentialProfit / potentialLoss;
                setValue('risk_reward_ratio', Number(ratio.toFixed(2)));
            } else {
                setValue('risk_reward_ratio', 0);
            }
        } else {
            setValue('risk_reward_ratio', 0);
        }
    }, [price, targetPrice, stopLoss, setValue]);

    useEffect(() => {
        if (initialData) {
            reset({
                ticker_symbol: initialData.ticker_symbol,
                trade_type: initialData.trade_type,
                quantity: initialData.quantity,
                price: initialData.price,
                total_amount: initialData.total_amount,
                executed_at: new Date(initialData.executed_at).toISOString().slice(0, 16),
                market_env: initialData.market_env || '',
                technical_analysis: initialData.technical_analysis || '',
                fundamental_analysis: initialData.fundamental_analysis || '',
                risk_reward_ratio: initialData.risk_reward_ratio || 1,
                confidence_level: initialData.confidence_level || 3,
                rationale: initialData.rationale || '',
                entry_trigger: initialData.entry_trigger || '',
                target_price: initialData.target_price || 0,
                stop_loss: initialData.stop_loss || 0,
                holding_period: initialData.holding_period || '',
                position_sizing_rationale: initialData.position_sizing_rationale || '',
                competitor_analysis: initialData.competitor_analysis || '',
                catalyst: initialData.catalyst || '',
            });
        } else {
            reset({
                ticker_symbol: '',
                trade_type: 'BUY',
                quantity: 0,
                price: 0,
                total_amount: 0,
                executed_at: new Date().toISOString().slice(0, 16),
                market_env: '',
                technical_analysis: '',
                fundamental_analysis: '',
                risk_reward_ratio: 1,
                confidence_level: 3,
                rationale: '',
                entry_trigger: '',
                target_price: 0,
                stop_loss: 0,
                holding_period: '',
                position_sizing_rationale: '',
                competitor_analysis: '',
                catalyst: '',
            });
        }
    }, [initialData, reset]);

    const handleFormSubmit = (data: any) => {
        const formattedData = {
            ...data,
            quantity: Number(data.quantity),
            price: Number(data.price),
            total_amount: Number(data.total_amount),
            executed_at: new Date(data.executed_at).toISOString(),
        };
        onSubmit(formattedData);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initialData ? '取引編集' : '新規取引登録'}</DialogTitle>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <Controller
                                name="ticker_symbol"
                                control={control}
                                rules={{
                                    required: '銘柄コードは必須です',
                                    maxLength: { value: 10, message: '10文字以内で入力してください' },
                                    pattern: { value: /^[A-Z0-9.\-]+$/i, message: '英数字、ピリオド、ハイフンのみ使用可能です' }
                                }}
                                render={({ field, fieldState: { error } }: { field: any, fieldState: { error: any } }) => (
                                    <TextField
                                        {...field}
                                        label="銘柄コード"
                                        fullWidth
                                        error={!!error}
                                        helperText={error?.message}
                                        placeholder="例: 7203, AAPL"
                                        inputProps={{ style: { textTransform: 'uppercase' } }}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value.toUpperCase())}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller
                                name="trade_type"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} select label="売買区分" fullWidth>
                                        <MenuItem value="BUY">買い</MenuItem>
                                        <MenuItem value="SELL">売り</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller
                                name="executed_at"
                                control={control}
                                rules={{
                                    required: '約定日時は必須です',
                                    validate: (value) => new Date(value) <= new Date() || '未来の日時は選択できません'
                                }}
                                render={({ field, fieldState: { error } }: { field: any, fieldState: { error: any } }) => (
                                    <TextField
                                        {...field}
                                        label="約定日時"
                                        type="datetime-local"
                                        fullWidth
                                        error={!!error}
                                        helperText={error?.message}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller
                                name="quantity"
                                control={control}
                                rules={{
                                    required: '数量は必須です',
                                    min: { value: 0.000001, message: '0より大きい値を入力してください' }
                                }}
                                render={({ field, fieldState: { error } }: { field: any, fieldState: { error: any } }) => (
                                    <TextField
                                        {...field}
                                        label="数量"
                                        type="number"
                                        fullWidth
                                        error={!!error}
                                        helperText={error?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller
                                name="price"
                                control={control}
                                rules={{
                                    required: '単価は必須です',
                                    min: { value: 0, message: '0以上の値を入力してください' }
                                }}
                                render={({ field, fieldState: { error } }: { field: any, fieldState: { error: any } }) => (
                                    <TextField
                                        {...field}
                                        label="単価"
                                        type="number"
                                        fullWidth
                                        error={!!error}
                                        helperText={error?.message || priceSourceInfo}
                                        disabled={isFetchingPrice}
                                        InputProps={{
                                            endAdornment: isFetchingPrice ? <span style={{ fontSize: '12px', color: 'gray' }}>取得中...</span> : null
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name="total_amount"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="合計金額"
                                        type="number"
                                        fullWidth
                                        disabled
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="理由・根拠（セクション）"
                                fullWidth
                                disabled
                                size="small"
                                sx={{ mt: 2, bgcolor: 'action.hover' }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Controller
                                name="market_env"
                                control={control}
                                render={({ field }: { field: any }) => (
                                    <TextField
                                        {...field}
                                        label="市場環境"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        placeholder="例: 上昇トレンド、レンジ相場など"
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Controller
                                name="technical_analysis"
                                control={control}
                                render={({ field }: { field: any }) => (
                                    <TextField
                                        {...field}
                                        label="テクニカル分析"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        placeholder="例: RSI売られすぎ、ダブルボトム完成など"
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Controller
                                name="fundamental_analysis"
                                control={control}
                                render={({ field }: { field: any }) => (
                                    <TextField
                                        {...field}
                                        label="ファンダメンタル分析"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        placeholder="例: 好決算、上方修正期待など"
                                    />
                                )}
                            />
                        </Grid>



                        <Grid item xs={12}>
                            <Controller
                                name="confidence_level"
                                control={control}
                                render={({ field }: { field: any }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="確信度 (1-5)"
                                        fullWidth
                                    >
                                        {[1, 2, 3, 4, 5].map((val) => (
                                            <MenuItem key={val} value={val}>
                                                {val === 5 ? '5 (最高)' : val === 1 ? '1 (最低)' : val}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Controller
                                name="rationale"
                                control={control}
                                render={({ field }: { field: any }) => (
                                    <TextField
                                        {...field}
                                        label="総合的な売買根拠"
                                        fullWidth
                                        multiline
                                        rows={3}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Enhanced Entry Rationale Fields */}
                        <Grid item xs={12}>
                            <TextField
                                label="エントリー計画"
                                fullWidth
                                disabled
                                size="small"
                                sx={{ mt: 2, bgcolor: 'action.hover' }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Controller
                                name="entry_trigger"
                                control={control}
                                render={({ field }: { field: any }) => (
                                    <TextField
                                        {...field}
                                        label="エントリー理由/トリガー"
                                        fullWidth
                                        multiline
                                        rows={2}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Controller
                                name="catalyst"
                                control={control}
                                render={({ field }: { field: any }) => (
                                    <TextField
                                        {...field}
                                        label="カタリスト（材料）"
                                        fullWidth
                                        multiline
                                        rows={2}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Controller
                                name="holding_period"
                                control={control}
                                render={({ field }: { field: any }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="保有期間の想定"
                                        fullWidth
                                    >
                                        <MenuItem value="">未設定</MenuItem>
                                        <MenuItem value="デイトレ">デイトレ</MenuItem>
                                        <MenuItem value="スイング">スイング</MenuItem>
                                        <MenuItem value="中期">中期</MenuItem>
                                        <MenuItem value="長期">長期</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="リスク管理"
                                fullWidth
                                disabled
                                size="small"
                                sx={{ mt: 2, bgcolor: 'action.hover' }}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <Controller
                                name="target_price"
                                control={control}
                                render={({ field }: { field: any }) => (
                                    <TextField
                                        {...field}
                                        label="目標価格"
                                        type="number"
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <Controller
                                name="stop_loss"
                                control={control}
                                render={({ field }: { field: any }) => (
                                    <TextField
                                        {...field}
                                        label="損切りライン"
                                        type="number"
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Controller
                                name="risk_reward_ratio"
                                control={control}
                                render={({ field }: { field: any }) => (
                                    <TextField
                                        {...field}
                                        label="リスクリワード比（自動計算）"
                                        fullWidth
                                        disabled
                                        value={field.value > 0 ? `1:${field.value.toFixed(1)}` : '-'}
                                        helperText="エントリー価格、目標価格、損切りラインから自動計算"
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Controller
                                name="position_sizing_rationale"
                                control={control}
                                render={({ field }: { field: any }) => (
                                    <TextField
                                        {...field}
                                        label="ポジションサイズの根拠"
                                        fullWidth
                                        multiline
                                        rows={2}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Controller
                                name="competitor_analysis"
                                control={control}
                                render={({ field }: { field: any }) => (
                                    <TextField
                                        {...field}
                                        label="競合他社との比較"
                                        fullWidth
                                        multiline
                                        rows={2}
                                    />
                                )}
                            />
                        </Grid>

                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>キャンセル</Button>
                    <Button type="submit" variant="contained" color="primary">
                        {initialData ? '更新' : '登録'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default TradeDialog;

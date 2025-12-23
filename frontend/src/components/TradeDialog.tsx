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
    Typography,
    Divider,
    Tooltip,
    Checkbox,
    FormControlLabel,
    Paper,
    Box,
    Card,
    CardContent,
} from '@mui/material';
import tradeService, { Trade, TradeCreate, StockAnalysis, ChecklistItem } from '../services/tradeService';

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
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisData, setAnalysisData] = useState<StockAnalysis | null>(null);

    const handleAutoAnalysis = async () => {
        if (!tickerSymbol) return;
        setIsAnalyzing(true);
        try {
            const analysis = await tradeService.getStockAnalysis(tickerSymbol);
            setAnalysisData(analysis);
        } catch (error) {
            console.error("Analysis failed", error);
            alert("分析データの取得に失敗しました。銘柄コードを確認してください。");
        } finally {
            setIsAnalyzing(false);
        }
    };



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
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>{initialData ? '取引編集' : '新規取引登録'}</DialogTitle>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {/* Left Column: Input Forms */}
                        <Grid item xs={analysisData ? 8 : 12}>
                            <Grid container spacing={2}>
                                {/* ... Existing Inputs ... */}
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
                                                inputProps={{ step: 100 }}
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

                                <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        理由・根拠
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleAutoAnalysis}
                                        disabled={isAnalyzing || !tickerSymbol}
                                    >
                                        {isAnalyzing ? '分析中...' : 'データを自動取得'}
                                    </Button>
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider />
                                </Grid>

                                <Grid item xs={12}>
                                    <Controller
                                        name="market_env"
                                        control={control}
                                        render={({ field }: { field: any }) => (
                                            <Tooltip title="現在の市場全体のトレンド（上昇・下降・レンジ）や地合いの強弱を入力します。" arrow placement="top">
                                                <TextField
                                                    {...field}
                                                    label="市場環境"
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                    placeholder="例: 上昇トレンド、レンジ相場など"
                                                />
                                            </Tooltip>
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Controller
                                        name="technical_analysis"
                                        control={control}
                                        render={({ field }: { field: any }) => (
                                            <Tooltip title="チャートパターン、インジケーター（RSI, MACD等）、移動平均線などの分析結果を入力します。" arrow placement="top">
                                                <TextField
                                                    {...field}
                                                    label="テクニカル分析"
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                    placeholder="例: RSI売られすぎ、ダブルボトム完成など"
                                                />
                                            </Tooltip>
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Controller
                                        name="fundamental_analysis"
                                        control={control}
                                        render={({ field }: { field: any }) => (
                                            <Tooltip title="業績、決算内容、割安・割高判断（PER, PBR）などの分析を入力します。" arrow placement="top">
                                                <TextField
                                                    {...field}
                                                    label="ファンダメンタル分析"
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                    placeholder="例: 好決算、上方修正期待など"
                                                />
                                            </Tooltip>
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
                                            <Tooltip title="市場環境・テクニカル・ファンダメンタルを統合した、このトレードの全体的なシナリオを入力します。" arrow placement="top">
                                                <TextField
                                                    {...field}
                                                    label="トレードシナリオ・総合判断"
                                                    placeholder="例: 上昇トレンド継続中かつ好材料が出たため、短期での上値追いを狙う。リスクリワードも良好。"
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                />
                                            </Tooltip>
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12} sx={{ mt: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        エントリー計画
                                    </Typography>
                                    <Divider />
                                </Grid>

                                <Grid item xs={12}>
                                    <Controller
                                        name="entry_trigger"
                                        control={control}
                                        render={({ field }: { field: any }) => (
                                            <Tooltip title="「今」このタイミングでエントリーした具体的なきっかけ（ブレイクアウト、押し目、など）を入力します。" arrow placement="top">
                                                <TextField
                                                    {...field}
                                                    label="エントリートリガー"
                                                    placeholder="例: 25日移動平均線での反発を確認、出来高急増、ゴールデンクロスなど"
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                />
                                            </Tooltip>
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Controller
                                        name="catalyst"
                                        control={control}
                                        render={({ field }: { field: any }) => (
                                            <Tooltip title="株価変動のきっかけとなる材料（ニュース、決算発表、政策変更など）を入力します。" arrow placement="top">
                                                <TextField
                                                    {...field}
                                                    label="カタリスト（材料）"
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                />
                                            </Tooltip>
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

                                <Grid item xs={12} sx={{ mt: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        リスク管理
                                    </Typography>
                                    <Divider />
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
                                            <Tooltip title="なぜこの株数（ロット）にしたのか、資金管理の観点からの理由を入力します。" arrow placement="top">
                                                <TextField
                                                    {...field}
                                                    label="ポジションサイズの根拠"
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                />
                                            </Tooltip>
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Right Column: Analysis Checklist */}
                        {analysisData && (
                            <Grid item xs={4}>
                                <Paper elevation={3} sx={{ p: 2, height: '100%', overflowY: 'auto', maxHeight: '80vh' }}>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        分析チェックリスト
                                    </Typography>
                                    <Typography variant="caption" display="block" color="textSecondary" gutterBottom>
                                        エントリー時の確認用チェックリストです。自動判定された項目はチェックが入っています。
                                    </Typography>

                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, backgroundColor: '#f5f5f5', p: 1 }}>
                                            市場環境
                                        </Typography>
                                        {analysisData.checklist.market.length > 0 ? analysisData.checklist.market.map((item, index) => (
                                            <FormControlLabel
                                                key={`market-${index}-${tickerSymbol}`}
                                                control={
                                                    <Checkbox
                                                        defaultChecked={item.is_met}
                                                        color="primary"
                                                    />
                                                }
                                                label={
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">{item.label}</Typography>
                                                        <Typography variant="caption" color="textSecondary">{item.text}</Typography>
                                                    </Box>
                                                }
                                            />
                                        )) : <Typography variant="caption">特筆すべき変動なし</Typography>}
                                    </Box>

                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, backgroundColor: '#f5f5f5', p: 1 }}>
                                            テクニカル
                                        </Typography>
                                        {analysisData.checklist.technical.map((item, index) => (
                                            <FormControlLabel
                                                key={`tech-${index}-${tickerSymbol}`}
                                                control={
                                                    <Checkbox
                                                        defaultChecked={item.is_met}
                                                        color="primary"
                                                    />
                                                }
                                                label={
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">{item.label}</Typography>
                                                        <Typography variant="caption" color="textSecondary">{item.text}</Typography>
                                                    </Box>
                                                }
                                            />
                                        ))}
                                    </Box>

                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, backgroundColor: '#f5f5f5', p: 1 }}>
                                            ファンダメンタル
                                        </Typography>
                                        {analysisData.checklist.fundamental.map((item, index) => (
                                            <FormControlLabel
                                                key={`fund-${index}-${tickerSymbol}`}
                                                control={
                                                    <Checkbox
                                                        defaultChecked={item.is_met}
                                                        color="primary"
                                                    />
                                                }
                                                label={
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">{item.label}</Typography>
                                                        <Typography variant="caption" color="textSecondary">{item.text}</Typography>
                                                    </Box>
                                                }
                                            />
                                        ))}
                                    </Box>
                                </Paper>
                            </Grid>
                        )}
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

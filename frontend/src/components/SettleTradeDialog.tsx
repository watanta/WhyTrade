import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Typography,
    Divider,
    Box,
} from '@mui/material';
import { Trade, TradeClose } from '../services/tradeService';

interface SettleTradeDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: TradeClose) => void;
    trade: Trade | null;
}

const SettleTradeDialog: React.FC<SettleTradeDialogProps> = ({ open, onClose, onSubmit, trade }) => {
    const { control, handleSubmit, reset, watch } = useForm({
        defaultValues: {
            closing_price: 0,
            closed_at: new Date().toISOString().slice(0, 16),
        },
    });

    const closingPrice = watch('closing_price');
    const [previewProfit, setPreviewProfit] = useState(0);

    useEffect(() => {
        if (trade && closingPrice) {
            const price = Number(closingPrice);
            if (trade.trade_type === 'BUY') {
                setPreviewProfit((price - trade.price) * trade.quantity);
            } else {
                setPreviewProfit((trade.price - price) * trade.quantity);
            }
        } else {
            setPreviewProfit(0);
        }
    }, [trade, closingPrice]);

    useEffect(() => {
        if (open) {
            reset({
                closing_price: trade?.price || 0,
                closed_at: new Date().toISOString().slice(0, 16),
            });
        }
    }, [open, trade, reset]);

    const handleFormSubmit = (data: { closing_price: number; closed_at: string }) => {
        const formattedData: TradeClose = {
            closing_price: Number(data.closing_price),
            closed_at: new Date(data.closed_at).toISOString(),
        };
        onSubmit(formattedData);
    };

    if (!trade) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>取引の決済</DialogTitle>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            銘柄: {trade.ticker_symbol} ({trade.trade_type === 'BUY' ? '買い' : '売り'})
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            約定価格: {trade.price.toLocaleString()} 円
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            数量: {trade.quantity.toLocaleString()}
                        </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Controller
                                name="closing_price"
                                control={control}
                                rules={{ required: '決済単価は必須です', min: { value: 0, message: '0以上の値を入力してください' } }}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        label="決済単価"
                                        type="number"
                                        fullWidth
                                        error={!!error}
                                        helperText={error?.message}
                                        autoFocus
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name="closed_at"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="決済日時"
                                        type="datetime-local"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ p: 2, bgcolor: previewProfit >= 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', borderRadius: 1 }}>
                                <Typography variant="subtitle2">
                                    予想損益
                                </Typography>
                                <Typography variant="h6" color={previewProfit >= 0 ? 'success.main' : 'error.main'}>
                                    {previewProfit >= 0 ? '+' : ''}{previewProfit.toLocaleString()} 円
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>キャンセル</Button>
                    <Button type="submit" variant="contained" color="primary">
                        決済を確定
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default SettleTradeDialog;

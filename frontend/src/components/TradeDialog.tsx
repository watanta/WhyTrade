import React, { useEffect } from 'react';
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
import { Trade, TradeCreate } from '../services/tradeService';

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
        },
    });

    const quantity = watch('quantity');
    const price = watch('price');

    useEffect(() => {
        setValue('total_amount', (quantity || 0) * (price || 0));
    }, [quantity, price, setValue]);

    useEffect(() => {
        if (initialData) {
            reset({
                ticker_symbol: initialData.ticker_symbol,
                trade_type: initialData.trade_type,
                quantity: initialData.quantity,
                price: initialData.price,
                total_amount: initialData.total_amount,
                executed_at: new Date(initialData.executed_at).toISOString().slice(0, 16),
            });
        } else {
            reset({
                ticker_symbol: '',
                trade_type: 'BUY',
                quantity: 0,
                price: 0,
                total_amount: 0,
                executed_at: new Date().toISOString().slice(0, 16),
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
                                rules={{ required: '銘柄コードは必須です' }}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        label="銘柄コード"
                                        fullWidth
                                        error={!!error}
                                        helperText={error?.message}
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
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="約定日時"
                                        type="datetime-local"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller
                                name="quantity"
                                control={control}
                                rules={{ required: '数量は必須です', min: { value: 0.0001, message: '0より大きい値を入力してください' } }}
                                render={({ field, fieldState: { error } }) => (
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
                                rules={{ required: '単価は必須です', min: { value: 0, message: '0以上の値を入力してください' } }}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        label="単価"
                                        type="number"
                                        fullWidth
                                        error={!!error}
                                        helperText={error?.message}
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

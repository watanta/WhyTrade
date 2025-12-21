import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Rating,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Paper,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import tradeService, { Reflection, ReflectionCreate, Trade } from '../services/tradeService';

interface ReflectionDialogProps {
    open: boolean;
    onClose: () => void;
    trade: Trade | null;
}

const ReflectionDialog: React.FC<ReflectionDialogProps> = ({ open, onClose, trade }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [existingReflection, setExistingReflection] = useState<Reflection | null>(null);

    const { control, handleSubmit, reset, setValue } = useForm<ReflectionCreate>();

    useEffect(() => {
        if (open && trade?.id) {
            fetchReflection();
        } else {
            reset();
            setExistingReflection(null);
            setError(null);
        }
    }, [open, trade]);

    const fetchReflection = async () => {
        if (!trade?.id) return;
        setIsLoading(true);
        setError(null);
        try {
            const reflection = await tradeService.getReflection(trade.id);
            setExistingReflection(reflection);
            setValue('what_went_well', reflection.what_went_well || '');
            setValue('what_went_wrong', reflection.what_went_wrong || '');
            setValue('lessons_learned', reflection.lessons_learned || '');
            setValue('action_items', reflection.action_items || '');
            setValue('satisfaction_rating', reflection.satisfaction_rating || 0);
        } catch (err: any) {
            // It's normal to not have a reflection yet
            if (err.response?.status !== 404) {
                setError('振り返りの取得に失敗しました');
            } else {
                setExistingReflection(null);
                reset();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: ReflectionCreate) => {
        if (!trade?.id) return;
        setIsLoading(true);
        setError(null);
        try {
            if (existingReflection) {
                await tradeService.updateReflection(trade.id, data);
            } else {
                await tradeService.createReflection(trade.id, data);
            }
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.detail || '保存に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    if (!open) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>取引の振り返り</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {isLoading && !existingReflection && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {trade && (
                        <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                            <Typography variant="subtitle2" gutterBottom color="primary" sx={{ mb: 2 }}>
                                📝 エントリー時の根拠
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">市場環境</Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {trade.market_env || '-'}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">テクニカル分析</Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {trade.technical_analysis || '-'}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">ファンダメンタル分析</Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {trade.fundamental_analysis || '-'}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">リスクリワード比</Typography>
                                <Typography variant="body2">
                                    {trade.risk_reward_ratio || '-'}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">確信度 (1-5)</Typography>
                                <Typography variant="body2">
                                    {trade.confidence_level || '-'}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary">その他の根拠</Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {trade.rationale || '-'}
                                </Typography>
                            </Box>
                        </Paper>
                    )}

                    <Box sx={{ mb: 3 }}>
                        <Typography component="legend">満足度評価</Typography>
                        <Controller
                            name="satisfaction_rating"
                            control={control}
                            defaultValue={3}
                            render={({ field }) => (
                                <Rating
                                    name="satisfaction_rating"
                                    value={Number(field.value)}
                                    onChange={(_, newValue) => {
                                        field.onChange(newValue);
                                    }}
                                />
                            )}
                        />
                    </Box>

                    <Controller
                        name="what_went_well"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="dense"
                                label="良かった点 (Keep)"
                                fullWidth
                                multiline
                                rows={3}
                                variant="outlined"
                                sx={{ mb: 2 }}
                            />
                        )}
                    />

                    <Controller
                        name="what_went_wrong"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="dense"
                                label="悪かった点 (Problem)"
                                fullWidth
                                multiline
                                rows={3}
                                variant="outlined"
                                sx={{ mb: 2 }}
                            />
                        )}
                    />

                    <Controller
                        name="lessons_learned"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="dense"
                                label="学んだこと (Learn)"
                                fullWidth
                                multiline
                                rows={3}
                                variant="outlined"
                                sx={{ mb: 2 }}
                            />
                        )}
                    />

                    <Controller
                        name="action_items"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="dense"
                                label="次回へのアクション (Try)"
                                fullWidth
                                multiline
                                rows={3}
                                variant="outlined"
                            />
                        )}
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>キャンセル</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
                        {isLoading ? '保存中...' : '保存'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ReflectionDialog;

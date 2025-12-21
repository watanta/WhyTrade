import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Paper,
} from '@mui/material';
import { Trade } from '../services/tradeService';

interface RationaleViewDialogProps {
    open: boolean;
    onClose: () => void;
    trade: Trade | null;
}

const RationaleViewDialog: React.FC<RationaleViewDialogProps> = ({ open, onClose, trade }) => {
    if (!open) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>エントリー時の根拠</DialogTitle>
            <DialogContent>
                {trade && (
                    <Paper elevation={2} sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" gutterBottom color="primary" sx={{ mb: 2 }}>
                            📝 {trade.ticker_symbol} - {new Date(trade.executed_at).toLocaleDateString()}
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
                            <Typography variant="caption" color="text.secondary">競合他社との比較</Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {trade.competitor_analysis || '-'}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">エントリー理由/トリガー</Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {trade.entry_trigger || '-'}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">カタリスト（材料）</Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {trade.catalyst || '-'}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">保有期間の想定</Typography>
                            <Typography variant="body2">
                                {trade.holding_period || '-'}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">目標価格</Typography>
                            <Typography variant="body2">
                                {trade.target_price || '-'}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">損切りライン</Typography>
                            <Typography variant="body2">
                                {trade.stop_loss || '-'}
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

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">ポジションサイズの根拠</Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {trade.position_sizing_rationale || '-'}
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
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>閉じる</Button>
            </DialogActions>
        </Dialog>
    );
};

export default RationaleViewDialog;

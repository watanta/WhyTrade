import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Collapse,
    Chip,
    CircularProgress,
    Alert,
    Tooltip,
    Tabs,
    Tab,
} from '@mui/material';
import {
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    CheckCircle as CheckCircleIcon,
    RateReview as RateReviewIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { fetchPositions, settleTrade, addTrade } from '../features/trades/tradeSlice';
import { RootState, AppDispatch } from '../features/store';
import SettleTradeDialog from '../components/SettleTradeDialog';
import TradeDialog from '../components/TradeDialog';
import ReflectionDialog from '../components/ReflectionDialog';
import RationaleViewDialog from '../components/RationaleViewDialog';
import { Trade, Position, TradeClose, TradeCreate, TradeUpdate } from '../services/tradeService';
import { Add as AddIcon } from '@mui/icons-material';
import { Button } from '@mui/material';

const PositionRow = (props: { position: Position, onSettle: (trade: Trade) => void, onReflect: (trade: Trade) => void, onViewRationale: (trade: Trade) => void, showProfitLoss: boolean }) => {
    const { position, onSettle, onReflect, onViewRationale, showProfitLoss } = props;
    const [open, setOpen] = useState(false);

    // Find the entry trade (trade without related_trade_id)
    const entryTrade = position.trades.find(t => !t.related_trade_id);
    const isClosedPosition = entryTrade?.status === 'CLOSED';

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    {position.ticker_symbol}
                </TableCell>
                <TableCell align="right">{Math.round(position.total_quantity).toLocaleString()}</TableCell>
                <TableCell align="right">{Math.round(position.average_price).toLocaleString()}</TableCell>
                <TableCell align="right">{Math.round(position.total_amount).toLocaleString()}</TableCell>
                {showProfitLoss && (
                    <TableCell
                        align="right"
                        sx={{
                            fontWeight: 'bold',
                            color: position.profit_loss && position.profit_loss > 0 ? 'success.main' :
                                position.profit_loss && position.profit_loss < 0 ? 'error.main' :
                                    'text.primary'
                        }}
                    >
                        {position.profit_loss !== null && position.profit_loss !== undefined
                            ? `${position.profit_loss > 0 ? '+' : ''}${Math.round(position.profit_loss).toLocaleString()}`
                            : '-'}
                    </TableCell>
                )}
                <TableCell align="right">
                    {isClosedPosition && entryTrade ? (
                        <Tooltip title="振り返りを入力">
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={() => onReflect(entryTrade)}
                            >
                                <RateReviewIcon />
                            </IconButton>
                        </Tooltip>
                    ) : null}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div" sx={{ fontSize: '1rem' }}>
                                内訳（個別取引）
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>約定日時</TableCell>
                                        <TableCell>売買</TableCell>
                                        <TableCell align="right">数量</TableCell>
                                        <TableCell align="right">単価</TableCell>
                                        <TableCell>理由</TableCell>
                                        <TableCell align="center">アクション</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {position.trades.map((trade) => (
                                        <TableRow key={trade.id}>
                                            <TableCell>{new Date(trade.executed_at).toLocaleString()}</TableCell>
                                            <TableCell>{trade.trade_type === 'BUY' ? '買い' : '売り'}</TableCell>
                                            <TableCell align="right">{Math.round(trade.quantity).toLocaleString()}</TableCell>
                                            <TableCell align="right">{Math.round(trade.price).toLocaleString()}</TableCell>
                                            <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                <Tooltip title={trade.rationale || ''}>
                                                    <span>{trade.rationale || '-'}</span>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                    {!trade.related_trade_id && (
                                                        <Tooltip title="エントリー根拠を確認">
                                                            <IconButton
                                                                size="small"
                                                                color="info"
                                                                onClick={() => onViewRationale(trade)}
                                                            >
                                                                <InfoIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {trade.status === 'OPEN' && (
                                                        <Tooltip title="この取引を決済する">
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => onSettle(trade)}
                                                            >
                                                                <CheckCircleIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

const PositionsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { positions, isLoading, error } = useSelector((state: RootState) => state.trades);
    const [settleDialogOpen, setSettleDialogOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [reflectionDialogOpen, setReflectionDialogOpen] = useState(false);
    const [rationaleDialogOpen, setRationaleDialogOpen] = useState(false);
    const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const includeClosed = tabValue === 1;
        dispatch(fetchPositions(includeClosed));
    }, [dispatch, tabValue]);

    const handleSettleClick = (trade: Trade) => {
        setSelectedTrade(trade);
        setSettleDialogOpen(true);
    };

    const handleSettleDialogClose = () => {
        setSettleDialogOpen(false);
        setSelectedTrade(null);
    };

    const handleSettleSubmit = async (data: TradeClose) => {
        if (selectedTrade) {
            await dispatch(settleTrade({ id: selectedTrade.id, data }));
            // Refresh positions after settlement
            dispatch(fetchPositions());
        }
        handleSettleDialogClose();
    };

    const handleAddClick = () => {
        setAddDialogOpen(true);
    };

    const handleAddDialogClose = () => {
        setAddDialogOpen(false);
    };

    const handleAddDialogSubmit = async (data: TradeCreate | TradeUpdate) => {
        await dispatch(addTrade(data as TradeCreate));
        // Refresh positions after adding new trade
        dispatch(fetchPositions());
        handleAddDialogClose();
    };

    const handleReflectClick = (trade: Trade) => {
        setSelectedTrade(trade);
        setReflectionDialogOpen(true);
    };

    const handleReflectionDialogClose = () => {
        setReflectionDialogOpen(false);
        setSelectedTrade(null);
    };

    const handleViewRationaleClick = (trade: Trade) => {
        setSelectedTrade(trade);
        setRationaleDialogOpen(true);
    };

    const handleRationaleDialogClose = () => {
        setRationaleDialogOpen(false);
        setSelectedTrade(null);
    };

    if (isLoading && positions.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    ポジション
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddClick}
                >
                    新規ポジション
                </Button>
            </Box>

            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
                <Tab label="保有中" />
                <Tab label="決済済み" />
            </Tabs>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>銘柄</TableCell>
                            <TableCell align="right">合計数量</TableCell>
                            <TableCell align="right">平均取得単価</TableCell>
                            <TableCell align="right">合計金額</TableCell>
                            {tabValue === 1 && <TableCell align="right">損益</TableCell>}
                            <TableCell align="right" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {positions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={tabValue === 1 ? 7 : 6} align="center">
                                    現在保有しているポジションはありません。
                                </TableCell>
                            </TableRow>
                        ) : (
                            positions.map((position) => (
                                <PositionRow
                                    key={position.ticker_symbol}
                                    position={position}
                                    onSettle={handleSettleClick}
                                    onReflect={handleReflectClick}
                                    onViewRationale={handleViewRationaleClick}
                                    showProfitLoss={tabValue === 1}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <SettleTradeDialog
                open={settleDialogOpen}
                onClose={handleSettleDialogClose}
                onSubmit={handleSettleSubmit}
                trade={selectedTrade}
            />

            <TradeDialog
                open={addDialogOpen}
                onClose={handleAddDialogClose}
                onSubmit={handleAddDialogSubmit}
                initialData={null}
            />

            <ReflectionDialog
                open={reflectionDialogOpen}
                onClose={handleReflectionDialogClose}
                trade={selectedTrade}
            />

            <RationaleViewDialog
                open={rationaleDialogOpen}
                onClose={handleRationaleDialogClose}
                trade={selectedTrade}
            />
        </Box>
    );
};

export default PositionsPage;

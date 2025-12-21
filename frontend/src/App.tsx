import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box, Container, AppBar, Toolbar, Typography } from '@mui/material'

function App() {
    return (
        <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            WhyTrade
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
                    <Routes>
                        <Route path="/" element={
                            <Box>
                                <Typography variant="h4" gutterBottom>
                                    株式売買意思決定PDCAアプリ
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    WhyTradeへようこそ。売買の意思決定を記録し、振り返りを通じて投資スキルを向上させましょう。
                                </Typography>
                            </Box>
                        } />
                    </Routes>
                </Container>
            </Box>
        </Router>
    )
}

export default App

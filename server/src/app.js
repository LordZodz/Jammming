import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import authRouter from './routes/auth.js';

config();

const port = process.env.PORT || 3001;

const app = express();

app.use(cors({
    origin: process.env.CLIENT_BASE_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(cookieParser());

app.use('/auth', authRouter);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Listening at http://127.0.0.1:${port}`);
});
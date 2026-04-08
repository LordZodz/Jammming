import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import authRouter from './routes/auth.js';

// load environment variables from .env file
const configResult = config();
if (configResult.error) {
    console.error('Error loading .env file:', configResult.error);
    process.exit(1);
};

const base_url = process.env.SERVER_BASE_URL;
const port = process.env.SERVER_PORT;

const app = express();

app.use(cors({
    origin: process.env.CLIENT_BASE_URL,
    credentials: true,
}));
app.use(cookieParser());

app.use('/auth', authRouter);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Listening at ${base_url}`);
});
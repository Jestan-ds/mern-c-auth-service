/* eslint-disable @typescript-eslint/no-unused-vars */
import 'reflect-metadata';
import express from 'express';
import logger from './config/logger';
import { HttpError } from 'http-errors';
import authRouter from './routes/auth';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Welcome to auth-service!!! ');
});

app.use('/auth', authRouter);

// Global error handler

app.use(
  (
    err: HttpError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.error(err.message);
    const status = err.status || 500;

    res.status(status).json({
      errors: [
        {
          type: err.name,
          message: err.message,
          path: '',
          location: '',
        },
      ],
    });
  },
);

export default app;

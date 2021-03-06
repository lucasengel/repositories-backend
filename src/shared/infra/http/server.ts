import 'reflect-metadata';
import 'express-async-errors';
import 'dotenv/config';

import express, { NextFunction, Request, Response } from 'express';
import { errors } from 'celebrate';
import cors from 'cors';

import uploadConfig from '@config/upload';
import AppError from '@shared/errors/AppError';
import routes from './routes';
import rateLimiter from './middlewares/rateLimiter';

import '@shared/container';
import '@shared/infra/typeorm';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/files', express.static(uploadConfig.uploadsFolder));
// rateLimiter after static files so users can d/l assets with no limits
app.use(rateLimiter);
app.use(routes);
app.use(errors());
app.use(
  (error: Error, request: Request, response: Response, _: NextFunction) => {
    if (error instanceof AppError) {
      return response.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }

    console.error(error);

    return response.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  },
);

app.listen(3333, () => {
  // eslint-disable-next-line no-console
  console.log('Server started on: http://localhost:3333/');
});

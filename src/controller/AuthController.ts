import fs from 'fs';
import path from 'path';
import { NextFunction, Response } from 'express';
import { JwtPayload, sign } from 'jsonwebtoken';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';

import { Config } from '../config';
// import createHttpError from 'http-errors';

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    //validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.status(400).json({ errors: result.array() });
      return;
    }

    const { firstName, lastName, email, password } = req.body;

    // if(!email){
    //   const error = createHttpError(400, 'Email is required');
    //   next(error);
    //   return
    // }

    this.logger.debug('New Request to register user', {
      firstName,
      lastName,
      email,
      password: '****',
    });
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });
      this.logger.info('User Has Been Registered Successfully', {
        id: user.id,
      });
      let privateKey: Buffer;
      try {
        privateKey = fs.readFileSync(
          path.join(__dirname, '../../certs/private.pem'),
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        const error = createHttpError(500, 'Failed to read private key');
        next(error);
        return;
      }
      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '1h',
        issuer: 'auth-service',
      });
      const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
        algorithm: 'HS256',
        expiresIn: '1y',
        issuer: 'auth-service',
      });
      res.cookie('accessToken', accessToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60, //1hour
        httpOnly: true,
      });

      res.cookie('refreshToken', refreshToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 365, //1week
        httpOnly: true,
      });

      // return the id of created user
      res.status(201).json({
        id: user.id,
      });
    } catch (error) {
      next(error);
      return;
    }
  }
}

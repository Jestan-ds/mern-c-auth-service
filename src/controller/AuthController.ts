import { NextFunction, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';

import { TokenService } from '../services/TokenService';
// import createHttpError from 'http-errors';

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
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

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      //from services through dependency injection
      const accessToken = this.tokenService.generateAccessToken(payload);

      //persist refresh token
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: newRefreshToken.id,
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

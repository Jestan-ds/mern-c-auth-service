import { NextFunction, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { AuthRequest, RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';

import { TokenService } from '../services/TokenService';
import createHttpError from 'http-errors';
import { CredentialService } from '../services/CredentialService';
// import createHttpError from 'http-errors';

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
    private credentialService: CredentialService,
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

  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    //validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.status(400).json({ errors: result.array() });
      return;
    }

    const { email, password } = req.body;

    // if(!email){
    //   const error = createHttpError(400, 'Email is required');
    //   next(error);
    //   return
    // }

    this.logger.debug('New Request to login a user', {
      email,
      password: '****',
    });
    //check if email exists in database
    //compare password
    try {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        const error = createHttpError(400, "Email password doesn't match");
        next(error);
        return;
      }

      const passwordMatch = await this.credentialService.comparePassword(
        password,
        user.password,
      );
      if (!passwordMatch) {
        const error = createHttpError(400, "Email or  password doesn't match");
        next(error);
        return;
      }

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

      this.logger.info('User Has Been Logged In Successfully', {
        id: user.id,
      });

      // return the id of created user
      res.status(200).json({
        id: user.id,
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  async self(req: AuthRequest, res: Response) {
    const user = await this.userService.findById(Number(req.auth.sub));
    res.json({ ...user, password: undefined });
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payload: JwtPayload = {
        sub: req.auth.sub,
        role: req.auth.role,
      };
      const accessToken = this.tokenService.generateAccessToken(payload);
      const user = await this.userService.findById(Number(req.auth.sub));
      if (!user) {
        const error = createHttpError(
          400,
          'User with token could not be found',
        );
        next(error);
        return;
      }

      //persist refresh token
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      //Delete old refresh token
      await this.tokenService.deleteRefreshToken(Number(req.auth.id));

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

      this.logger.info('User Has Been Logged In Successfully', {
        id: user.id,
      });

      res.json({
        id: user.id,
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await this.tokenService.deleteRefreshToken(Number(req.auth.id));

      this.logger.info('Refresh Token Has Been Deleted Successfully', {
        id: req.auth.id,
      });
      this.logger.info('User Has Been Logged Out Successfully', {
        id: req.auth.sub,
      });

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.json({
        sucess: true,
      });
    } catch (err) {
      next(err);
      return;
    }
  }
}

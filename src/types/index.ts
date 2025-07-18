import { Request } from 'express';

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  tenantId?: number;
}
export interface RegisterUserRequest extends Request {
  body: UserData;
}

// export interface TokenPayload {
//   sub: string;
//   role: string;
// }

export interface AuthRequest extends Request {
  auth: {
    sub: string;
    role: string;
    id?: string;
  };
}

export type AuthCookie = {
  accessToken: string;
  refreshToken: string;
};

export interface IRefreshTokenPayload {
  id: string;
}

export interface Itenant {
  name: string;
  address: string;
}

export interface CreateTenantRequest extends Request {
  body: Itenant;
}

export interface CreateUserRequest extends Request {
  body: UserData;
}

export interface LimitedUserData {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  tenantId: number;
}

export interface UpdateUserRequest extends Request {
  body: LimitedUserData;
}

export interface UserQueryParams {
  perPage: number;
  currentPage: number;
  q: string;
  role: string;
}

export interface TenantQueryParams {
  q: string;
  perPage: number;
  currentPage: number;
}

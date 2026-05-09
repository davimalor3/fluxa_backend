import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../types/auth-user.interface';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<Request>();

    return request.user as AuthUser;
  },
);

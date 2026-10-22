import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { AuthenticationError } from '../infrastructure/access-token';
import type { OwnerRequest } from './local-access.guard';

export const CurrentOwner = createParamDecorator((_data: unknown, context: ExecutionContext): string => {
  const owner = context.switchToHttp().getRequest<OwnerRequest>().ownerId;
  if (!owner) throw new AuthenticationError();
  return owner;
});

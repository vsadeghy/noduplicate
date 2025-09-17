import { RedisService } from '@liaoliaots/nestjs-redis';
import {
  applyDecorators,
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  SetMetadata,
  UseInterceptors,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import type Redis from 'ioredis';
import { tap } from 'rxjs';

const defaultThrottleKeyTransform: ThrottleTransform = (req: Request) => {
  return `throttle:${req.originalUrl}:${req.body}`;
};
const throttleKeyTransformMetadata = 'throttleTransform';
const conflictErrorMetadata = 'throttleError';

type ThrottleTransform = (req: Request) => string;
type ThrottleOptions = {
  transform?: ThrottleTransform;
  conflictError?: string;
};
export function Throttle(options?: ThrottleOptions) {
  return applyDecorators(
    SetMetadata(
      throttleKeyTransformMetadata,
      options?.transform || defaultThrottleKeyTransform,
    ),
    SetMetadata(conflictErrorMetadata, options?.conflictError),
    UseInterceptors(ThrottleInterceptor),
  );
}
@Injectable()
class ThrottleInterceptor implements NestInterceptor {
  private redis: Redis;
  constructor(
    redisService: RedisService,
    private reflector: Reflector,
  ) {
    this.redis = redisService.getOrThrow();
  }
  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const throttleKeyTransform = this.reflector.get<ThrottleTransform>(
      throttleKeyTransformMetadata,
      context.getHandler() || '',
    );
    const conflictError = this.reflector.get<string | undefined>(
      conflictErrorMetadata,
      context.getHandler() || '',
    );
    const cacheKey = throttleKeyTransform(req);
    const cacheValue = Math.random().toString();
    console.log(cacheKey, conflictError);
    if (!(await this.redis.setnx(cacheKey, cacheValue))) {
      throw new ConflictException(conflictError);
    }
    return next.handle().pipe(
      tap(async () => {
        if ((await this.redis.get(cacheKey)) === cacheValue) {
          this.redis.del(cacheKey);
        }
      }),
    );
  }
}

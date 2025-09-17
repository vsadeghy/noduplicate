import { RedisService } from '@liaoliaots/nestjs-redis';
import {
  applyDecorators,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  SetMetadata,
  UseInterceptors,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import type Redis from 'ioredis';
import { of, tap } from 'rxjs';

const cacheKeyMetadata = 'cacheKey';
const cacheTtlMetadata = 'cacheTtl';
export function Cachable(options?: { key?: string; ttl?: number }) {
  return applyDecorators(
    SetMetadata(cacheKeyMetadata, options?.key || ''),
    SetMetadata(cacheTtlMetadata, options?.ttl || 60),
    UseInterceptors(CacheInterceptor),
  );
}

@Injectable()
class CacheInterceptor implements NestInterceptor {
  private redis: Redis;
  constructor(
    redisService: RedisService,
    private reflector: Reflector,
  ) {
    this.redis = redisService.getOrThrow();
  }
  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const cacheKey = this.reflector.get<string>(
      cacheKeyMetadata,
      context.getHandler() || '',
    );
    const ttl = this.reflector.get<number>(
      cacheTtlMetadata,
      context.getHandler() || '',
    );
    if (req.method === 'GET') {
      const cached = await this.redis.get(cacheKey);
      if (cached) return of(JSON.parse(cached));
      return next.handle().pipe(
        tap(async (res) => {
          await this.redis.setex(cacheKey, ttl, JSON.stringify(res));
        }),
      );
    }
    return next.handle();
  }
}

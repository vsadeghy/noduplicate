import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    TasksModule,
    RedisModule.forRoot({
      config: { host: process.env.REDIS_HOST ?? 'localhost' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

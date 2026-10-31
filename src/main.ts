import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './config/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: {
      log: (message: string, context?: string) => logger.info(message, { context }),
      error: (message: string, trace?: string, context?: string) => logger.error(message, { context, trace }),
      warn: (message: string, context?: string) => logger.warn(message, { context }),
      debug: (message: string, context?: string) => logger.debug(message, { context }),
      verbose: (message: string, context?: string) => logger.verbose(message, { context }),
    },
  });

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  logger.info(`Application starting in ${process.env.NODE_ENV || 'development'} mode`, { context: 'Bootstrap' });
  logger.info(`Database mode: ${process.env.DB_MODE || 'memory'}`, { context: 'Bootstrap' });

  await app.listen(3000);
  logger.info('JS MyGoals API running on http://localhost:3000', { context: 'Bootstrap' });
}
bootstrap();

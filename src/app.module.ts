import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { createClient } from 'redis';
import { ArticlesModule } from './articles/articles.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import configuration from './config/configuration';
import { User } from './users/entities/user.entity';
import { Article } from './articles/entities/article.entity';

/**
 * Корневой модуль приложения
 * Здесь происходит конфигурация всех основных модулей и сервисов
 */
@Module({
  imports: [
    // Настройка модуля конфигурации
    ConfigModule.forRoot({
      load: [configuration],  // Загружаем конфигурацию из файла
      isGlobal: true,         // Делаем конфигурацию глобально доступной
    }),

    // Настройка подключения к базе данных PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [User, Article],  // Регистрируем сущности
        synchronize: process.env.NODE_ENV !== 'production',  // Автоматическая синхронизация схемы в dev режиме
        migrations: ['dist/migrations/*.js'],  // Путь к миграциям
        migrationsRun: true,  // Автоматический запуск миграций
      }),
      inject: [ConfigService],
    }),

    // Настройка Redis кэширования
    CacheModule.register({
      isGlobal: true,
      store: 'redis',
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      ttl: 60000,  // Время жизни кэша в миллисекундах
    }),

    // Регистрируем модули приложения
    ArticlesModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}

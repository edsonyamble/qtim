import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../users/entities/user.entity';

/**
 * Модуль аутентификации
 * Отвечает за управление аутентификацией и авторизацией пользователей
 */
@Module({
  imports: [
    // Регистрируем сущность User для работы с базой данных
    TypeOrmModule.forFeature([User]),
    // Подключаем модуль Passport для аутентификации
    PassportModule,
    // Настраиваем JWT модуль с асинхронной конфигурацией
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: configService.get('jwt.expiresIn') },
      }),
      inject: [ConfigService],
    }),
  ],
  // Регистрируем контроллер для обработки HTTP запросов
  controllers: [AuthController],
  // Регистрируем сервис и стратегию JWT
  providers: [AuthService, JwtStrategy],
  // Экспортируем сервис для использования в других модулях
  exports: [AuthService],
})
export class AuthModule {} 
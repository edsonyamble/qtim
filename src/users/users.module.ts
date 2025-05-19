// Импортируем необходимые модули из NestJS
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

/**
 * Модуль пользователей
 * Регистрирует сущность User для использования в других модулях
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [TypeOrmModule],
})
export class UsersModule {} 
// Импортируем необходимые модули из NestJS
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

// Импортируем компоненты модуля статей
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Article } from './entities/article.entity';

/**
 * Модуль статей
 * Отвечает за управление статьями в приложении
 */
@Module({
  imports: [
    // Регистрируем сущность Article для работы с базой данных
    TypeOrmModule.forFeature([Article]),
    // Настраиваем кэширование для модуля
    CacheModule.register()
  ],
  // Регистрируем контроллер для обработки HTTP запросов
  controllers: [ArticlesController],
  // Регистрируем сервис для бизнес-логики
  providers: [ArticlesService],
})
export class ArticlesModule {} 
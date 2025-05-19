// Импортируем необходимые модули из NestJS
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Основная функция для запуска приложения
 * Эта функция инициализирует и настраивает NestJS приложение
 */
async function bootstrap() {
  // Создаем экземпляр приложения, используя корневой модуль AppModule
  const app = await NestFactory.create(AppModule);
  
  // Включаем CORS (Cross-Origin Resource Sharing)
  // Это позволяет делать запросы к API с других доменов
  app.enableCors();

  // Настраиваем глобальную валидацию для всех входящих запросов
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,     // Удаляет все свойства, которые не имеют декораторов
    transform: true,     // Автоматически преобразует типы данных
  }));

  // Получаем порт из переменных окружения или используем порт 3000 по умолчанию
  const port = process.env.PORT || 3000;
  
  // Запускаем сервер на указанном порту
  await app.listen(port);
  
  // Выводим сообщение о том, что приложение запущено
  console.log(`Application is running on: http://localhost:${port}`);
}

// Запускаем приложение
bootstrap(); 
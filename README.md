# QTim - API для блоговой платформы

## Описание проекта
QTim - это современная API платформа для блогов, построенная с использованием NestJS. Проект предоставляет полный набор функций для управления статьями и аутентификации пользователей.

### Основные возможности
- 🔐 Аутентификация и авторизация пользователей (регистрация, вход)
- 📝 Создание, редактирование и удаление статей
- 🔍 Продвинутая фильтрация статей
- ⚡ Кэширование для оптимизации производительности
- 🔒 Защита маршрутов с помощью JWT

## Технологии
- NestJS - фреймворк для создания масштабируемых серверных приложений
- TypeORM - ORM для работы с базой данных
- PostgreSQL - реляционная база данных
- JWT - для аутентификации
- Redis - для кэширования


## Установка и запуск

### Предварительные требования
- Node.js (v14 или выше)
- PostgreSQL
- Redis (опционально, для кэширования)


### Установка зависимостей
```bash
npm install
```

### Настройка окружения
Создайте файл `.env` в корневой директории проекта:
```env
# База данных
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=qtim

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1h

# Redis (опционально)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Запуск проекта
```bash
# Режим разработки
npm run start:dev

# Продакшн режим
npm run build
npm run start:prod
```

## API Endpoints

### Аутентификация
- `POST /auth/register` - Регистрация нового пользователя
  ```json
  {
    "email": "user@example.com",
    "username": "username",
    "password": "password123"
  }
  ```
- `POST /auth/login` - Вход в систему
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### Статьи
- `GET /articles` - Получение списка статей с фильтрацией
- `POST /articles` - Создание новой статьи (требуется JWT)
  ```json
  {
    "title": "Заголовок статьи",
    "content": "Содержание статьи"
  }
  ```
- `GET /articles/:id` - Получение статьи по ID
- `PUT /articles/:id` - Обновление статьи (требуется JWT)
- `DELETE /articles/:id` - Удаление статьи (требуется JWT)

## Фильтрация статей
API поддерживает следующие параметры фильтрации:
- По автору: `?authorId=123`
- По дате: `?startDate=2024-01-01&endDate=2024-12-31`
- Поиск по тексту: `?search=ключевое слово`
- Пагинация: `?page=1&limit=10`

## Безопасность
- Все защищенные маршруты требуют JWT токен в заголовке `Authorization: Bearer <token>`
- Пароли хешируются перед сохранением в базу данных
- Пользователи могут редактировать и удалять только свои статьи

## Разработка
```bash
# Запуск тестов
npm run test

# Проверка линтером
npm run lint

# Форматирование кода
npm run format
```

## Разработчик 
Эдсон Ямбле
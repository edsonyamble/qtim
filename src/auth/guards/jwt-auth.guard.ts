// Импортируем необходимые декораторы из NestJS
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Guard для защиты маршрутов
 * Используется для проверки JWT токена в запросах
 * Применяется к маршрутам, требующим аутентификации
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {} 
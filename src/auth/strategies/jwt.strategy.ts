import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * JWT стратегия аутентификации
 * Отвечает за валидацию JWT токенов и извлечение данных пользователя
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Извлекаем токен из заголовка Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Не игнорируем истекшие токены
      ignoreExpiration: false,
      // Получаем секретный ключ из конфигурации
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  /**
   * Валидирует JWT токен и возвращает данные пользователя
   * @param payload - данные из JWT токена
   * @returns объект с данными пользователя
   */
  async validate(payload: any) {
    return { id: payload.sub, email: payload.email };
  }
} 
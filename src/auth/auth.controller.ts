import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

/**
 * Контроллер аутентификации
 * Обрабатывает HTTP запросы для регистрации и входа пользователей
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Регистрирует нового пользователя
   * @param registerDto - данные для регистрации
   * @returns данные зарегистрированного пользователя
   */
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Авторизует пользователя
   * @param loginDto - данные для входа
   * @returns JWT токен доступа
   */
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
} 
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';

/**
 * Сервис аутентификации
 * Отвечает за регистрацию и авторизацию пользователей
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Регистрирует нового пользователя
   * @param registerDto - данные для регистрации
   * @returns данные пользователя без пароля
   * @throws UnauthorizedException если пользователь с таким email уже существует
   */
  async register(registerDto: RegisterDto) {
    // Проверяем, существует ли пользователь с таким email
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Хешируем пароль и создаем нового пользователя
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Сохраняем пользователя в базу данных
    await this.usersRepository.save(user);
    const { password, ...result } = user;
    return result;
  }

  /**
   * Авторизует пользователя
   * @param loginDto - данные для входа
   * @returns JWT токен доступа
   * @throws UnauthorizedException если учетные данные неверны
   */
  async login(loginDto: LoginDto) {
    // Ищем пользователя по email
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Создаем JWT токен
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
} 
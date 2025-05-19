import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto, UpdateArticleDto, ArticleFilterDto } from './dto/article.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Контроллер для работы со статьями
 * Обрабатывает HTTP запросы к API статей
 */
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  /**
   * Создает новую статью
   * @param createArticleDto - данные для создания статьи
   * @param req - объект запроса с информацией о пользователе
   * @returns созданная статья
   */
  @Post()
  @UseGuards(JwtAuthGuard)  // Требуется аутентификация
  create(@Body() createArticleDto: CreateArticleDto, @Request() req) {
    return this.articlesService.create(createArticleDto, req.user);
  }

  /**
   * Получает список статей с возможностью фильтрации
   * @param filterDto - параметры фильтрации и пагинации
   * @returns список статей
   */
  @Get()
  findAll(@Query() filterDto: ArticleFilterDto) {
    return this.articlesService.findAll(filterDto);
  }

  /**
   * Получает статью по ID
   * @param id - идентификатор статьи
   * @returns найденная статья
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  /**
   * Обновляет существующую статью
   * @param id - идентификатор статьи
   * @param updateArticleDto - данные для обновления
   * @param req - объект запроса с информацией о пользователе
   * @returns обновленная статья
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)  // Требуется аутентификация
  update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Request() req,
  ) {
    return this.articlesService.update(id, updateArticleDto, req.user);
  }

  /**
   * Удаляет статью
   * @param id - идентификатор статьи
   * @param req - объект запроса с информацией о пользователе
   * @returns сообщение об успешном удалении
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)  // Требуется аутентификация
  remove(@Param('id') id: string, @Request() req) {
    return this.articlesService.remove(id, req.user);
  }
} 
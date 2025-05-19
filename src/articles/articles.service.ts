import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { Article } from './entities/article.entity';
import { CreateArticleDto, UpdateArticleDto, ArticleFilterDto } from './dto/article.dto';
import { User } from '../users/entities/user.entity';

/**
 * Сервис для работы со статьями
 * Обеспечивает CRUD операции и кэширование
 */
@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Создает новую статью
   * @param createArticleDto - данные для создания статьи
   * @param author - автор статьи
   * @returns созданная статья
   */
  async create(createArticleDto: CreateArticleDto, author: User): Promise<Article> {
    const article = this.articlesRepository.create({
      ...createArticleDto,
      author,
    });
    const savedArticle = await this.articlesRepository.save(article);
    await this.cacheManager.del('articles_list');
    return savedArticle;
  }

  /**
   * Получает список статей с пагинацией и фильтрацией
   * @param filterDto - параметры фильтрации и пагинации
   * @returns список статей с метаданными пагинации
   */
  async findAll(filterDto: ArticleFilterDto) {
    const cacheKey = `articles_list_${JSON.stringify(filterDto)}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    // Создаем запрос с пагинацией и связями
    const query = this.articlesRepository.createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .skip((filterDto.page - 1) * filterDto.limit)
      .take(filterDto.limit);

    // Применяем фильтры
    if (filterDto.author) {
      query.andWhere('author.id = :authorId', { authorId: filterDto.author });
    }

    if (filterDto.fromDate && filterDto.toDate) {
      query.andWhere('article.publishDate BETWEEN :fromDate AND :toDate', {
        fromDate: filterDto.fromDate,
        toDate: filterDto.toDate,
      });
    }

    const [articles, total] = await query.getManyAndCount();
    const result = {
      items: articles,
      total,
      page: filterDto.page,
      limit: filterDto.limit,
      pages: Math.ceil(total / filterDto.limit),
    };

    await this.cacheManager.set(cacheKey, result, 60000); // кэшируем на 1 минуту
    return result;
  }

  /**
   * Получает статью по ID
   * @param id - идентификатор статьи
   * @returns найденная статья
   * @throws NotFoundException если статья не найдена
   */
  async findOne(id: string): Promise<Article> {
    const cacheKey = `article_${id}`;
    const cachedArticle = await this.cacheManager.get<Article>(cacheKey);

    if (cachedArticle) {
      return cachedArticle;
    }

    const article = await this.articlesRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException(`Article with ID "${id}" not found`);
    }

    await this.cacheManager.set(cacheKey, article, 60000); // кэшируем на 1 минуту
    return article;
  }

  /**
   * Обновляет статью
   * @param id - идентификатор статьи
   * @param updateArticleDto - данные для обновления
   * @param user - пользователь, выполняющий обновление
   * @returns обновленная статья
   * @throws NotFoundException если статья не найдена или пользователь не является автором
   */
  async update(id: string, updateArticleDto: UpdateArticleDto, user: User): Promise<Article> {
    const article = await this.findOne(id);

    if (article.author.id !== user.id) {
      throw new NotFoundException('You can only update your own articles');
    }

    await this.articlesRepository.update(id, updateArticleDto);
    await this.cacheManager.del(`article_${id}`);
    await this.cacheManager.del('articles_list');
    return this.findOne(id);
  }

  /**
   * Удаляет статью
   * @param id - идентификатор статьи
   * @param user - пользователь, выполняющий удаление
   * @returns сообщение об успешном удалении
   * @throws NotFoundException если статья не найдена или пользователь не является автором
   */
  async remove(id: string, user: User): Promise<{ message: string }> {
    const article = await this.findOne(id);

    if (article.author.id !== user.id) {
      throw new NotFoundException('You can only delete your own articles');
    }

    await this.articlesRepository.delete(id);
    await this.cacheManager.del(`article_${id}`);
    await this.cacheManager.del('articles_list');
    return { message: 'Article successfully deleted' };
  }

  /**
   * Находит все статьи с возможностью фильтрации
   * @param filters - параметры фильтрации
   * @returns массив статей
   */
  async findAllFiltered(filters?: {
    authorId?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }): Promise<Article[]> {
    const queryBuilder = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author');

    if (filters?.authorId) {
      queryBuilder.andWhere('author.id = :authorId', { authorId: filters.authorId });
    }

    if (filters?.startDate && filters?.endDate) {
      queryBuilder.andWhere('article.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(article.title LIKE :search OR article.content LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    return queryBuilder.getMany();
  }
} 
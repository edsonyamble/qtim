import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';
import { CreateArticleDto, UpdateArticleDto, ArticleFilterDto } from './dto/article.dto';
import { User } from '../users/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let mockRepository;
  let mockCacheManager;

  const mockUser: User = {
    id: '1',
    email: 'test@test.com',
    username: 'test',
    password: 'password',
    articles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockArticle: Article = {
    id: '1',
    title: 'Test Article',
    description: 'Test Description',
    publishDate: new Date(),
    author: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn().mockReturnValue(mockArticle),
      save: jest.fn().mockResolvedValue(mockArticle),
      findOne: jest.fn().mockResolvedValue(mockArticle),
      update: jest.fn().mockResolvedValue(true),
      delete: jest.fn().mockResolvedValue(true),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockArticle], 1]),
      })),
    };

    mockCacheManager = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(Article),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an article and clear cache', async () => {
      const createArticleDto: CreateArticleDto = {
        title: 'Test Article',
        description: 'Test Description',
        publishDate: new Date(),
      };

      const result = await service.create(createArticleDto, mockUser);
      expect(result).toEqual(mockArticle);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createArticleDto,
        author: mockUser,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockArticle);
      expect(mockCacheManager.del).toHaveBeenCalledWith('articles_list');
    });
  });

  describe('findAll', () => {
    const mockFilterDto: ArticleFilterDto = {
      page: 1,
      limit: 10,
    };

    const mockPaginatedResult = {
      items: [mockArticle],
      total: 1,
      page: 1,
      limit: 10,
      pages: 1,
    };

    it('should return articles from cache if exists', async () => {
      mockCacheManager.get.mockResolvedValueOnce(mockPaginatedResult);
      
      const result = await service.findAll(mockFilterDto);
      
      expect(result).toEqual(mockPaginatedResult);
      expect(mockCacheManager.get).toHaveBeenCalledWith(`articles_list_${JSON.stringify(mockFilterDto)}`);
      expect(mockRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should return articles from database if not in cache', async () => {
      const result = await service.findAll(mockFilterDto);
      
      expect(result).toEqual(mockPaginatedResult);
      expect(mockCacheManager.get).toHaveBeenCalledWith(`articles_list_${JSON.stringify(mockFilterDto)}`);
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `articles_list_${JSON.stringify(mockFilterDto)}`,
        mockPaginatedResult,
        60000
      );
    });
  });

  describe('findOne', () => {
    it('should return an article from cache if exists', async () => {
      mockCacheManager.get.mockResolvedValueOnce(mockArticle);
      const result = await service.findOne('1');
      expect(result).toEqual(mockArticle);
      expect(mockCacheManager.get).toHaveBeenCalledWith('article_1');
      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });

    it('should return an article from database if not in cache', async () => {
      const result = await service.findOne('1');
      expect(result).toEqual(mockArticle);
      expect(mockCacheManager.get).toHaveBeenCalledWith('article_1');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['author'],
      });
      expect(mockCacheManager.set).toHaveBeenCalledWith('article_1', mockArticle, 60000);
    });

    it('should throw NotFoundException if article not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);
      
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateArticleDto: UpdateArticleDto = {
      title: 'Updated Title',
    };

    it('should update article and clear cache', async () => {
      const result = await service.update('1', updateArticleDto, mockUser);
      
      expect(result).toEqual(mockArticle);
      expect(mockRepository.update).toHaveBeenCalledWith('1', updateArticleDto);
      expect(mockCacheManager.del).toHaveBeenCalledWith('article_1');
      expect(mockCacheManager.del).toHaveBeenCalledWith('articles_list');
    });

    it('should throw error if user is not the author', async () => {
      const differentUser = { ...mockUser, id: '2' };
      
      await expect(service.update('1', updateArticleDto, differentUser))
        .rejects.toThrow('You can only update your own articles');
    });
  });

  describe('remove', () => {
    it('should remove article and clear cache', async () => {
      const result = await service.remove('1', mockUser);
      
      expect(result).toEqual({ message: 'Article successfully deleted' });
      expect(mockRepository.delete).toHaveBeenCalledWith('1');
      expect(mockCacheManager.del).toHaveBeenCalledWith('article_1');
      expect(mockCacheManager.del).toHaveBeenCalledWith('articles_list');
    });

    it('should throw error if user is not the author', async () => {
      const differentUser = { ...mockUser, id: '2' };
      
      await expect(service.remove('1', differentUser))
        .rejects.toThrow('You can only delete your own articles');
    });
  });
}); 
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Сущность статьи
 * Представляет собой таблицу articles в базе данных
 */
@Entity('articles')
export class Article {
  // Уникальный идентификатор статьи
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Заголовок статьи
  @Column()
  title: string;

  // Содержание статьи
  @Column('text')
  description: string;

  // Дата публикации статьи
  @Column('timestamp')
  publishDate: Date;

  // Связь с автором статьи (многие к одному)
  @ManyToOne(() => User, (user) => user.articles)
  author: User;

  // Дата создания записи (автоматически заполняется)
  @CreateDateColumn()
  createdAt: Date;

  // Дата последнего обновления записи (автоматически обновляется)
  @UpdateDateColumn()
  updatedAt: Date;
} 
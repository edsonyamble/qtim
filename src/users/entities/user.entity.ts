import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Article } from '../../articles/entities/article.entity';
import { Exclude } from 'class-transformer';

/**
 * Сущность пользователя
 * Представляет собой таблицу users в базе данных
 */
@Entity('users')
export class User {
  // Уникальный идентификатор пользователя
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Email пользователя (уникальный)
  @Column({ unique: true })
  email: string;

  // Имя пользователя
  @Column()
  username: string;

  // Хешированный пароль пользователя
  // Исключается из сериализации при преобразовании в JSON
  @Column()
  @Exclude()
  password: string;

  // Связь с статьями пользователя (один ко многим)
  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  // Дата создания записи (автоматически заполняется)
  @CreateDateColumn()
  createdAt: Date;

  // Дата последнего обновления записи (автоматически обновляется)
  @UpdateDateColumn()
  updatedAt: Date;
} 
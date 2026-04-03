import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('categories')
export class CategoryEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | undefined;

  @CreateDateColumn()
  createdAt!: Date;
}
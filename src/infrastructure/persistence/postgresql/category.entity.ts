import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('categories')
export class CategoryEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | undefined;

  @UpdateDateColumn()
  updatedAt!: Date;
}
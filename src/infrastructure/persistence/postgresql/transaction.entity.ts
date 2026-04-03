import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { TransactionType, TransactionCategory } from '../../../dto/create-transaction.dto';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  description!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type!: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionCategory,
  })
  category!: TransactionCategory;

  @Column({ type: 'date' })
  transactionDate!: Date;

  @Column()
  account!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date;
}
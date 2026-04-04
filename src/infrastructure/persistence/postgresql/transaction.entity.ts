import { Entity, Column, PrimaryColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TransactionType } from '../../../dto/create-transaction.dto';
import { CategoryEntity } from './category.entity';
import { AccountEntity } from './account.entity';
import { TransactionItemEntity } from './transaction-item.entity';

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

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: 'categoryId' })
  category!: CategoryEntity;

  @Column('uuid')
  categoryId!: string;

  @ManyToOne(() => TransactionItemEntity)
  @JoinColumn({ name: 'transactionItemId' })
  transactionItem!: TransactionItemEntity;

  @Column('uuid')
  transactionItemId!: string;

  @ManyToOne(() => AccountEntity)
  @JoinColumn({ name: 'accountId' })
  account!: AccountEntity;

  @Column('uuid')
  accountId!: string;

  @Column({ type: 'date' })
  transactionDate!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date;
}
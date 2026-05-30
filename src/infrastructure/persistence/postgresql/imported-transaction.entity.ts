import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { TransactionType } from '../../../dto/create-transaction.dto';
import { FileImportEntity } from './file-import.entity';

@Entity('imported_transactions')
export class ImportedTransactionEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  fileImportId!: string;

  @ManyToOne(() => FileImportEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fileImportId' })
  fileImport!: FileImportEntity;

  @Column({ type: 'text' })
  rawText!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount?: number | null;

  @Column({ type: 'simple-enum', enum: TransactionType, nullable: true })
  type?: TransactionType | null;

  @Column({ type: 'uuid', nullable: true })
  categoryId?: string | null;

  @Column({ type: 'uuid', nullable: true })
  accountId?: string | null;

  @Column({ type: 'uuid', nullable: true })
  transactionItemId?: string | null;

  @Column({ type: 'date', nullable: true })
  transactionDate?: Date | null;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date | null;

  @Column({ type: 'boolean', nullable: true })
  settled?: boolean | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

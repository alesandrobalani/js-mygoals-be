import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('transaction_items')
export class TransactionItemEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @UpdateDateColumn()
  updatedAt!: Date;
}

import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('accounts')
export class AccountEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | undefined;

  @UpdateDateColumn()
  updatedAt!: Date;
}

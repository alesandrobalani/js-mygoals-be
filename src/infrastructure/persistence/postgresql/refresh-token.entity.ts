import { Entity, PrimaryColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ unique: true })
  token!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @Column('uuid')
  userId!: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt?: Date | null;

  @UpdateDateColumn()
  updatedAt!: Date;
}

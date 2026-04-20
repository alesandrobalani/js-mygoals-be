import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';
import { UserRole } from '../../../domain/entities/user.entity';

@Entity('users')
export class UserEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column()
  name!: string;

  @Column({ type: 'varchar', length: 50, default: UserRole.USER })
  role!: UserRole;

  @UpdateDateColumn()
  updatedAt!: Date;
}

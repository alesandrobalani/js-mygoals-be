import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

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

  @UpdateDateColumn()
  updatedAt!: Date;
}

import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { FileImportStatus } from '../../../domain/entities/file-import.entity';
import { UserEntity } from './user.entity';

@Entity('file_imports')
export class FileImportEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @Column({ unique: true })
  importIdentifier!: string;

  @Column()
  originalFileName!: string;

  @Column({ type: 'simple-enum', enum: FileImportStatus, default: FileImportStatus.PENDING })
  status!: FileImportStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

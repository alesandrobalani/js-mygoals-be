import { Injectable, Logger, Optional } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@Optional() private dataSource?: DataSource) {}

  async runMigrations(): Promise<void> {
    if (!this.dataSource) {
      this.logger.log('DataSource not available, skipping migrations');
      return;
    }

    try {
      this.logger.log('Running pending migrations...');
      const migrations = await this.dataSource.runMigrations();
      this.logger.log(`Successfully ran ${migrations.length} migration(s)`);
    } catch (error) {
      this.logger.error('Error running migrations:', error);
      throw error;
    }
  }
}

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Public } from './auth/decorators/public.decorator';

interface CollectionInfo {
  name: string;
  type: string;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection() private readonly mongoConnection: Connection
  ) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  async checkHealth() {
    try {
      // Check MongoDB connection
      const dbState = this.mongoConnection.readyState;
      const isConnected = dbState === 1;

      // Get some basic stats about the database
      let collections: CollectionInfo[] = [];
      if (isConnected && this.mongoConnection.db) {
        const collectionInfos = await this.mongoConnection.db.listCollections().toArray();
        collections = collectionInfos.map(col => ({
          name: col.name,
          type: col.type || 'collection'
        }));
      }

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: {
          connected: isConnected,
          state: this.getConnectionState(dbState),
          collections: collections.map(col => col.name)
        },
        environment: {
          nodeEnv: process.env.NODE_ENV || 'development',
          port: process.env.PORT || 5000
        }
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        database: {
          connected: false,
          state: 'error'
        }
      };
    }
  }

  private getConnectionState(state: number): string {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      99: 'uninitialized'
    };
    return states[state] || 'unknown';
  }
}

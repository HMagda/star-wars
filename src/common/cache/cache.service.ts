import {Injectable, OnModuleInit} from '@nestjs/common';
import {createClient} from 'redis';

@Injectable()
export class CacheService implements OnModuleInit {
    private client!: ReturnType<typeof createClient>;

    async onModuleInit() {
        this.client = createClient({
            url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
        });
        await this.client.connect();
    }

    async get(key: string): Promise<any> {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }

    async set(key: string, value: any, ttlSeconds: number): Promise<void> {
        await this.client.set(key, JSON.stringify(value), {EX: ttlSeconds});
    }
}

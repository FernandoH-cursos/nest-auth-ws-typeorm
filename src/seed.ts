import { NestFactory } from '@nestjs/core';

import { SeedModule } from './seed/seed.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const seedService = app.get(SeedService);

  await seedService.runSeed();
  await app.close();
}

bootstrap()
  .then(() => console.log('Seeding completed'))
  .catch((err) => console.error('Seeding failed', err));

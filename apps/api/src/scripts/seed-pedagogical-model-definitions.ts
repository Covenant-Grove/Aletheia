import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { PedagogicalModelDefinitionSeeder } from '../modules/curriculum/infrastructure/pedagogical-model-definition.seeder.js';

// Standalone maintenance entry point -- not wired into the running API
// process, same pattern as purge-expired-portfolio-items.ts. Invoked via
// `pnpm --filter @aletheia/api run seed:pedagogical-models` to (re)publish
// the pedagogical_model_definition rows described in
// pedagogical-model-definition.seed-data.ts. Safe to re-run: it upserts by
// (code, version).
async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const seeder = app.get(PedagogicalModelDefinitionSeeder);
    const count = await seeder.seed();
    // eslint-disable-next-line no-console
    console.log(`Seeded ${count} pedagogical model definition(s).`);
  } finally {
    await app.close();
  }
}

void main();

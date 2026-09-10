import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { EvidenceTypeDefinitionSeeder } from '../modules/curriculum/infrastructure/evidence-type-definition.seeder.js';

// Standalone maintenance entry point -- same pattern as
// seed-pedagogical-model-definitions.ts. Invoked via
// `pnpm --filter @aletheia/api run seed:evidence-types` to (re)publish the
// base evidence_type_definitions rows. Safe to re-run: upserts by
// (code, version).
async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const seeder = app.get(EvidenceTypeDefinitionSeeder);
    const count = await seeder.seed();
    // eslint-disable-next-line no-console
    console.log(`Seeded ${count} evidence type definition(s).`);
  } finally {
    await app.close();
  }
}

void main();

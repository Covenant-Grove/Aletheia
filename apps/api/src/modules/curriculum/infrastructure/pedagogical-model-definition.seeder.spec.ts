import { PrismaService } from '../../../platform/database/prisma.service.js';
import { CurriculumTemplateEngine } from './curriculum-template.engine.js';
import { PedagogicalModelDefinitionSeeder } from './pedagogical-model-definition.seeder.js';

describe('PedagogicalModelDefinitionSeeder', () => {
  it.each(['PUBLISHED', 'DEPRECATED', 'ARCHIVED', 'DRAFT'])(
    'does not overwrite an existing %s version or its publication date',
    async (status) => {
      const original = {
        code: 'MONTESSORI', version: 1, status,
        name: 'Admin-maintained model', description: 'Preserved description',
        metadata: { subjects: [] }, publishedAt: new Date('2026-01-01T00:00:00Z'),
      };
      const persisted = structuredClone(original);
      const upsert = jest.fn().mockImplementation(async ({ where, update, create }) => {
        if (where.code_version.code === original.code) {
          Object.assign(persisted, update);
          return persisted;
        }
        return create;
      });
      const prisma = { pedagogicalModelDefinition: { upsert } } as unknown as PrismaService;
      const seeder = new PedagogicalModelDefinitionSeeder(prisma, new CurriculumTemplateEngine());
      expect(await seeder.seed()).toBe(8);
      await seeder.seed();
      expect(persisted).toEqual(original);
    },
  );
});

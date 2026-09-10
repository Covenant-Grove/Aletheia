import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import supertest from 'supertest';
import { createApplication } from '../src/main.js';

// Admin CRUD surface for the data-driven curriculum foundation (issue #96
// Fase 0, section 40's literal test: adding a new domain/competency/track
// should be a data write through an API, not a code change + deploy).
// Exercises the full HTTP path (auth, GuardianOnlyGuard, Zod validation,
// Prisma persistence, status transitions) against real Postgres.
describe('Curriculum definitions admin API (real Postgres)', () => {
  let app: NestFastifyApplication;
  let guardianCookie: string;
  let outsiderCookie: string;

  async function registerAndGetCookie(emailPrefix: string): Promise<string> {
    const email = `${emailPrefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    const response = await supertest(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: 'somePassword123', fullName: 'Definitions Admin Test' })
      .expect(201);
    return [response.headers['set-cookie']].flat().find((c) => c?.startsWith('aletheia_session='))!;
  }

  beforeAll(async () => {
    app = await createApplication();
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    guardianCookie = await registerAndGetCookie('definitions-guardian');
    // A guardian is any user who is a FamilyMember of some family.
    await supertest(app.getHttpServer())
      .post('/api/v1/families')
      .set('Cookie', guardianCookie)
      .send({ name: 'Definitions Test Family', countryCode: 'BR' })
      .expect(201);

    // An authenticated user who never created/joined a family -- should be
    // rejected by GuardianOnlyGuard even though they're logged in.
    outsiderCookie = await registerAndGetCookie('definitions-outsider');
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects an unauthenticated request', async () => {
    await supertest(app.getHttpServer())
      .get('/api/v1/admin/curriculum-definitions/learning-domains')
      .expect(401);
  });

  it('rejects an authenticated user who is not a guardian of any family', async () => {
    await supertest(app.getHttpServer())
      .get('/api/v1/admin/curriculum-definitions/learning-domains')
      .set('Cookie', outsiderCookie)
      .expect(403);
  });

  it('creates, lists, and transitions a learning domain end-to-end', async () => {
    const code = `TEST.DOMAIN.${Date.now()}`;

    const createResponse = await supertest(app.getHttpServer())
      .post('/api/v1/admin/curriculum-definitions/learning-domains')
      .set('Cookie', guardianCookie)
      .send({ code, name: 'Test Domain' })
      .expect(201);

    expect(createResponse.body.status).toBe('DRAFT');
    const domainId = createResponse.body.id;

    const listResponse = await supertest(app.getHttpServer())
      .get('/api/v1/admin/curriculum-definitions/learning-domains')
      .set('Cookie', guardianCookie)
      .expect(200);
    expect(listResponse.body.some((d: { id: string }) => d.id === domainId)).toBe(true);

    const publishResponse = await supertest(app.getHttpServer())
      .patch(`/api/v1/admin/curriculum-definitions/learning-domains/${domainId}/status`)
      .set('Cookie', guardianCookie)
      .send({ status: 'PUBLISHED' })
      .expect(200);
    expect(publishResponse.body.status).toBe('PUBLISHED');
    expect(publishResponse.body.publishedAt).not.toBeNull();

    // Explicit transitions only -- can't skip PUBLISHED -> DRAFT.
    await supertest(app.getHttpServer())
      .patch(`/api/v1/admin/curriculum-definitions/learning-domains/${domainId}/status`)
      .set('Cookie', guardianCookie)
      .send({ status: 'DRAFT' })
      .expect(400);

    return domainId;
  });

  it('creates a competency under a domain, optionally under a path, and a skill under the competency', async () => {
    const domainCode = `TEST.SKILL_TREE.DOMAIN.${Date.now()}`;
    const domain = await supertest(app.getHttpServer())
      .post('/api/v1/admin/curriculum-definitions/learning-domains')
      .set('Cookie', guardianCookie)
      .send({ code: domainCode, name: 'Skill Tree Domain' })
      .expect(201);

    const pathCode = `TEST.SKILL_TREE.PATH.${Date.now()}`;
    const path = await supertest(app.getHttpServer())
      .post('/api/v1/admin/curriculum-definitions/learning-paths')
      .set('Cookie', guardianCookie)
      .send({ code: pathCode, domainId: domain.body.id, name: 'Skill Tree Path' })
      .expect(201);

    const competencyCode = `TEST.SKILL_TREE.COMPETENCY.${Date.now()}`;
    const competency = await supertest(app.getHttpServer())
      .post('/api/v1/admin/curriculum-definitions/competency-definitions')
      .set('Cookie', guardianCookie)
      .send({
        code: competencyCode,
        domainId: domain.body.id,
        pathId: path.body.id,
        title: 'Skill Tree Competency',
      })
      .expect(201);
    expect(competency.body.pathId).toBe(path.body.id);

    const skillCode = `TEST.SKILL_TREE.SKILL.${Date.now()}`;
    const skill = await supertest(app.getHttpServer())
      .post('/api/v1/admin/curriculum-definitions/skill-definitions')
      .set('Cookie', guardianCookie)
      .send({ code: skillCode, competencyId: competency.body.id, title: 'Skill Tree Skill' })
      .expect(201);
    expect(skill.body.competencyId).toBe(competency.body.id);

    const listResponse = await supertest(app.getHttpServer())
      .get('/api/v1/admin/curriculum-definitions/skill-definitions')
      .set('Cookie', guardianCookie)
      .expect(200);
    expect(listResponse.body.some((s: { id: string }) => s.id === skill.body.id)).toBe(true);
  });

  it('rejects a malformed create payload with 400', async () => {
    await supertest(app.getHttpServer())
      .post('/api/v1/admin/curriculum-definitions/learning-domains')
      .set('Cookie', guardianCookie)
      .send({ code: 'lowercase-not-allowed', name: 'x' })
      .expect(400);
  });
});

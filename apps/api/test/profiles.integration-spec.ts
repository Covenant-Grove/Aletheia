import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import supertest from 'supertest';
import { createApplication } from '../src/main.js';

// Family-scoped pedagogical/theological profile CRUD (issue #96 Fase 1,
// sections 13/14) against real Postgres, with real family membership
// (not mocked) -- proves FamilyTenantGuard actually isolates one
// family's profile from another's, not just that the guard pair is
// present on the route.
describe('Pedagogical & Theological Profiles (real Postgres)', () => {
  let app: NestFastifyApplication;
  let familyACookie: string;
  let familyAId: string;
  let familyBCookie: string;
  let familyBId: string;

  async function registerWithFamily(prefix: string): Promise<{ cookie: string; familyId: string }> {
    const email = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    const registerResponse = await supertest(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: 'somePassword123', fullName: 'Profiles Test Guardian' })
      .expect(201);
    const cookie = [registerResponse.headers['set-cookie']]
      .flat()
      .find((c) => c?.startsWith('aletheia_session='))!;

    const familyResponse = await supertest(app.getHttpServer())
      .post('/api/v1/families')
      .set('Cookie', cookie)
      .send({ name: `${prefix} Family`, countryCode: 'BR' })
      .expect(201);

    return { cookie, familyId: familyResponse.body.id };
  }

  beforeAll(async () => {
    app = await createApplication();
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    const familyA = await registerWithFamily('profiles-family-a');
    familyACookie = familyA.cookie;
    familyAId = familyA.familyId;

    const familyB = await registerWithFamily('profiles-family-b');
    familyBCookie = familyB.cookie;
    familyBId = familyB.familyId;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Pedagogical Profile', () => {
    it('returns null when no profile has been created yet', async () => {
      const res = await supertest(app.getHttpServer())
        .get(`/api/v1/families/${familyAId}/curriculum/pedagogical-profile`)
        .set('Cookie', familyACookie)
        .expect(200);
      expect(res.body).toBeNull();
    });

    it('creates version 1 on first upsert, and version 2 on the next -- never mutating version 1', async () => {
      const v1 = await supertest(app.getHttpServer())
        .put(`/api/v1/families/${familyAId}/curriculum/pedagogical-profile`)
        .set('Cookie', familyACookie)
        .send({ primaryModelCode: 'CLASSICAL_TRIVIUM' })
        .expect(200);
      expect(v1.body.version).toBe(1);
      expect(v1.body.primaryModelCode).toBe('CLASSICAL_TRIVIUM');

      const v2 = await supertest(app.getHttpServer())
        .put(`/api/v1/families/${familyAId}/curriculum/pedagogical-profile`)
        .set('Cookie', familyACookie)
        .send({
          primaryModelCode: 'CHARLOTTE_MASON',
          secondaryModels: [{ code: 'MONTESSORI', weight: 0.2 }],
          overrides: { structureLevel: 'FLEXIBLE' },
        })
        .expect(200);
      expect(v2.body.version).toBe(2);
      expect(v2.body.primaryModelCode).toBe('CHARLOTTE_MASON');

      const current = await supertest(app.getHttpServer())
        .get(`/api/v1/families/${familyAId}/curriculum/pedagogical-profile`)
        .set('Cookie', familyACookie)
        .expect(200);
      expect(current.body.version).toBe(2);
      expect(current.body.primaryModelCode).toBe('CHARLOTTE_MASON');

      const history = await supertest(app.getHttpServer())
        .get(`/api/v1/families/${familyAId}/curriculum/pedagogical-profile/history`)
        .set('Cookie', familyACookie)
        .expect(200);
      expect(history.body).toHaveLength(2);
      expect(history.body[0].version).toBe(2);
      expect(history.body[1].version).toBe(1);
      // Version 1's original content is intact -- never mutated.
      expect(history.body[1].primaryModelCode).toBe('CLASSICAL_TRIVIUM');
    });

    it('rejects a malformed upsert (invalid code, out-of-range weight) with 400', async () => {
      await supertest(app.getHttpServer())
        .put(`/api/v1/families/${familyAId}/curriculum/pedagogical-profile`)
        .set('Cookie', familyACookie)
        .send({ primaryModelCode: 'lowercase-not-allowed' })
        .expect(400);

      await supertest(app.getHttpServer())
        .put(`/api/v1/families/${familyAId}/curriculum/pedagogical-profile`)
        .set('Cookie', familyACookie)
        .send({ primaryModelCode: 'MONTESSORI', secondaryModels: [{ code: 'ECLECTIC', weight: 2 }] })
        .expect(400);
    });

    it('tenant isolation: family B cannot read or write family A pedagogical profile', async () => {
      await supertest(app.getHttpServer())
        .get(`/api/v1/families/${familyAId}/curriculum/pedagogical-profile`)
        .set('Cookie', familyBCookie)
        .expect(403);

      await supertest(app.getHttpServer())
        .put(`/api/v1/families/${familyAId}/curriculum/pedagogical-profile`)
        .set('Cookie', familyBCookie)
        .send({ primaryModelCode: 'ECLECTIC' })
        .expect(403);

      // Family B's own (nonexistent) profile is unaffected/independent.
      const ownProfile = await supertest(app.getHttpServer())
        .get(`/api/v1/families/${familyBId}/curriculum/pedagogical-profile`)
        .set('Cookie', familyBCookie)
        .expect(200);
      expect(ownProfile.body).toBeNull();
    });

    it('rejects an unauthenticated request', async () => {
      await supertest(app.getHttpServer())
        .get(`/api/v1/families/${familyAId}/curriculum/pedagogical-profile`)
        .expect(401);
    });
  });

  describe('Theological Profile', () => {
    it('returns null when no profile has been created yet', async () => {
      const res = await supertest(app.getHttpServer())
        .get(`/api/v1/families/${familyAId}/curriculum/theological-profile`)
        .set('Cookie', familyACookie)
        .expect(200);
      expect(res.body).toBeNull();
    });

    it('creates and versions a theological profile with topic overrides', async () => {
      const v1 = await supertest(app.getHttpServer())
        .put(`/api/v1/families/${familyAId}/curriculum/theological-profile`)
        .set('Cookie', familyACookie)
        .send({ preferredTraditionCode: 'REFORMED' })
        .expect(200);
      expect(v1.body.version).toBe(1);

      const v2 = await supertest(app.getHttpServer())
        .put(`/api/v1/families/${familyAId}/curriculum/theological-profile`)
        .set('Cookie', familyACookie)
        .send({
          preferredTraditionCode: 'REFORMED',
          topicOverrides: { eschatology: 'REFORMED.ESCHATOLOGY.AMILLENNIALISM' },
        })
        .expect(200);
      expect(v2.body.version).toBe(2);
      expect(v2.body.topicOverrides.eschatology).toBe('REFORMED.ESCHATOLOGY.AMILLENNIALISM');

      const history = await supertest(app.getHttpServer())
        .get(`/api/v1/families/${familyAId}/curriculum/theological-profile/history`)
        .set('Cookie', familyACookie)
        .expect(200);
      expect(history.body).toHaveLength(2);
    });

    it('tenant isolation: family B cannot read or write family A theological profile', async () => {
      await supertest(app.getHttpServer())
        .get(`/api/v1/families/${familyAId}/curriculum/theological-profile`)
        .set('Cookie', familyBCookie)
        .expect(403);

      await supertest(app.getHttpServer())
        .put(`/api/v1/families/${familyAId}/curriculum/theological-profile`)
        .set('Cookie', familyBCookie)
        .send({ preferredTraditionCode: 'REFORMED' })
        .expect(403);
    });

    it('rejects an unauthenticated request', async () => {
      await supertest(app.getHttpServer())
        .get(`/api/v1/families/${familyAId}/curriculum/theological-profile`)
        .expect(401);
    });
  });
});

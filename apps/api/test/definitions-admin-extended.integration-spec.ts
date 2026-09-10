import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import supertest from 'supertest';
import { createApplication } from '../src/main.js';

// Extends the admin CRUD surface coverage (see
// definitions-admin.integration-spec.ts for the original five resources)
// to the four tables added after PR #100: RubricDefinition (+ criteria),
// EvidenceTypeDefinition, CurriculumDefinition (+ its domain/competency/
// rubric/activity join management), and ActivityDefinition (+ its
// competency/evidence-type joins). Same auth (PlatformAdminGuard), same
// shape (create + list + explicit status-transition per resource).
describe('Curriculum definitions admin API -- rubric/evidence/curriculum/activity (real Postgres)', () => {
  let app: NestFastifyApplication;
  let adminCookie: string;
  const adminEmail = `definitions-admin-ext-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

  beforeAll(async () => {
    process.env.PLATFORM_ADMIN_EMAILS = adminEmail;

    app = await createApplication();
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    const adminResponse = await supertest(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: adminEmail, password: 'somePassword123', fullName: 'Definitions Admin Ext Test' })
      .expect(201);
    adminCookie = [adminResponse.headers['set-cookie']]
      .flat()
      .find((c) => c?.startsWith('aletheia_session='))!;
  });

  afterAll(async () => {
    await app.close();
    delete process.env.PLATFORM_ADMIN_EMAILS;
  });

  it.each([
    'rubric-definitions',
    'evidence-type-definitions',
    'curriculum-definitions',
    'activity-definitions',
  ])('lists and enforces the lifecycle of %s', async (resource) => {
    const base = `/api/v1/admin/curriculum-definitions/${resource}`;
    await supertest(app.getHttpServer()).get(base).expect(401);
    const created = await supertest(app.getHttpServer())
      .post(base)
      .set('Cookie', adminCookie)
      .send({ code: `TEST.LIFECYCLE.${Date.now()}`, name: 'Lifecycle test' })
      .expect(201);
    expect(created.body.status).toBe('DRAFT');
    await supertest(app.getHttpServer())
      .post(base)
      .set('Cookie', adminCookie)
      .send({ code: created.body.code, name: 'Duplicate definition' })
      .expect(400);

    const listed = await supertest(app.getHttpServer())
      .get(base)
      .set('Cookie', adminCookie)
      .expect(200);
    expect(listed.body.some((row: { id: string }) => row.id === created.body.id)).toBe(true);

    const statusUrl = `${base}/${created.body.id}/status`;
    const published = await supertest(app.getHttpServer())
      .patch(statusUrl)
      .set('Cookie', adminCookie)
      .send({ status: 'PUBLISHED' })
      .expect(200);
    expect(published.body.publishedAt).not.toBeNull();
    await supertest(app.getHttpServer())
      .patch(statusUrl)
      .set('Cookie', adminCookie)
      .send({ status: 'DRAFT' })
      .expect(400);
    const deprecated = await supertest(app.getHttpServer())
      .patch(statusUrl)
      .set('Cookie', adminCookie)
      .send({ status: 'DEPRECATED' })
      .expect(200);
    expect(deprecated.body.status).toBe('DEPRECATED');
    expect(deprecated.body.deprecatedAt).not.toBeNull();
    await supertest(app.getHttpServer())
      .patch(`${base}/00000000-0000-0000-0000-000000000000/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'PUBLISHED' })
      .expect(404);
  });

  it('creates a rubric definition, adds criteria, and transitions its status', async () => {
    const code = `TEST.RUBRIC.${Date.now()}`;
    const rubric = await supertest(app.getHttpServer())
      .post('/api/v1/admin/curriculum-definitions/rubric-definitions')
      .set('Cookie', adminCookie)
      .send({ code, name: 'Test Rubric' })
      .expect(201);
    expect(rubric.body.status).toBe('DRAFT');

    const criterion = await supertest(app.getHttpServer())
      .post(`/api/v1/admin/curriculum-definitions/rubric-definitions/${rubric.body.id}/criteria`)
      .set('Cookie', adminCookie)
      .send({ code: 'CLARITY', label: 'Clareza', weight: 2 })
      .expect(201);
    expect(criterion.body.weight).toBe(2);

    const criteriaList = await supertest(app.getHttpServer())
      .get(`/api/v1/admin/curriculum-definitions/rubric-definitions/${rubric.body.id}/criteria`)
      .set('Cookie', adminCookie)
      .expect(200);
    expect(criteriaList.body.some((c: { id: string }) => c.id === criterion.body.id)).toBe(true);

    const published = await supertest(app.getHttpServer())
      .patch(`/api/v1/admin/curriculum-definitions/rubric-definitions/${rubric.body.id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'PUBLISHED' })
      .expect(200);
    expect(published.body.status).toBe('PUBLISHED');
  });

  it('rejects a criterion on a rubric that does not exist', async () => {
    await supertest(app.getHttpServer())
      .post('/api/v1/admin/curriculum-definitions/rubric-definitions/00000000-0000-0000-0000-000000000000/criteria')
      .set('Cookie', adminCookie)
      .send({ code: 'CLARITY', label: 'Clareza' })
      .expect(404);
  });

  it('creates and lists evidence type definitions', async () => {
    const code = `TEST.EVIDENCE.${Date.now()}`;
    const created = await supertest(app.getHttpServer())
      .post('/api/v1/admin/curriculum-definitions/evidence-type-definitions')
      .set('Cookie', adminCookie)
      .send({ code, name: 'Test Evidence Type' })
      .expect(201);

    const listResponse = await supertest(app.getHttpServer())
      .get('/api/v1/admin/curriculum-definitions/evidence-type-definitions')
      .set('Cookie', adminCookie)
      .expect(200);
    expect(listResponse.body.some((e: { id: string }) => e.id === created.body.id)).toBe(true);
  });

  it('creates a curriculum definition and links a domain, a competency, a rubric, and an activity', async () => {
    const domain = await supertest(app.getHttpServer())
      .post('/api/v1/admin/curriculum-definitions/learning-domains')
      .set('Cookie', adminCookie)
      .send({ code: `TEST.CURRIC.DOMAIN.${Date.now()}`, name: 'Curriculum Test Domain' })
      .expect(201);

    const competency = await supertest(app.getHttpServer())
      .post('/api/v1/admin/curriculum-definitions/competency-definitions')
      .set('Cookie', adminCookie)
      .send({
        code: `TEST.CURRIC.COMPETENCY.${Date.now()}`,
        domainId: domain.body.id,
        title: 'Curriculum Test Competency',
      })
      .expect(201);

    const rubric = await supertest(app.getHttpServer())
      .post('/api/v1/admin/curriculum-definitions/rubric-definitions')
      .set('Cookie', adminCookie)
      .send({ code: `TEST.CURRIC.RUBRIC.${Date.now()}`, name: 'Curriculum Test Rubric' })
      .expect(201);

    const activity = await supertest(app.getHttpServer())
      .post('/api/v1/admin/curriculum-definitions/activity-definitions')
      .set('Cookie', adminCookie)
      .send({ code: `TEST.CURRIC.ACTIVITY.${Date.now()}`, name: 'Curriculum Test Activity' })
      .expect(201);

    const curriculum = await supertest(app.getHttpServer())
      .post('/api/v1/admin/curriculum-definitions/curriculum-definitions')
      .set('Cookie', adminCookie)
      .send({ code: `TEST.CURRIC.${Date.now()}`, name: 'Curriculum Test' })
      .expect(201);

    await supertest(app.getHttpServer())
      .post(`/api/v1/admin/curriculum-definitions/curriculum-definitions/${curriculum.body.id}/domains`)
      .set('Cookie', adminCookie)
      .send({ domainId: domain.body.id })
      .expect(201);

    await supertest(app.getHttpServer())
      .post(`/api/v1/admin/curriculum-definitions/curriculum-definitions/${curriculum.body.id}/competencies`)
      .set('Cookie', adminCookie)
      .send({ competencyId: competency.body.id })
      .expect(201);

    await supertest(app.getHttpServer())
      .post(`/api/v1/admin/curriculum-definitions/curriculum-definitions/${curriculum.body.id}/rubrics`)
      .set('Cookie', adminCookie)
      .send({ rubricId: rubric.body.id })
      .expect(201);

    await supertest(app.getHttpServer())
      .post(`/api/v1/admin/curriculum-definitions/curriculum-definitions/${curriculum.body.id}/activities`)
      .set('Cookie', adminCookie)
      .send({ activityId: activity.body.id })
      .expect(201);

    const domainsList = await supertest(app.getHttpServer())
      .get(`/api/v1/admin/curriculum-definitions/curriculum-definitions/${curriculum.body.id}/domains`)
      .set('Cookie', adminCookie)
      .expect(200);
    expect(domainsList.body).toHaveLength(1);
    expect(domainsList.body[0].domainId).toBe(domain.body.id);

    const activitiesList = await supertest(app.getHttpServer())
      .get(`/api/v1/admin/curriculum-definitions/curriculum-definitions/${curriculum.body.id}/activities`)
      .set('Cookie', adminCookie)
      .expect(200);
    expect(activitiesList.body).toHaveLength(1);
    expect(activitiesList.body[0].activityId).toBe(activity.body.id);

    // Linking the same domain twice violates the unique constraint --
    // surfaced as 400, not a raw 500.
    await supertest(app.getHttpServer())
      .post(`/api/v1/admin/curriculum-definitions/curriculum-definitions/${curriculum.body.id}/domains`)
      .set('Cookie', adminCookie)
      .send({ domainId: domain.body.id })
      .expect(400);

    // Linking a domain that doesn't exist is a 400 (FK violation), not a
    // raw 500.
    await supertest(app.getHttpServer())
      .post(`/api/v1/admin/curriculum-definitions/curriculum-definitions/${curriculum.body.id}/domains`)
      .set('Cookie', adminCookie)
      .send({ domainId: '00000000-0000-0000-0000-000000000000' })
      .expect(400);
  });

  it('creates an activity definition and links a competency and an evidence type', async () => {
    const domain = await supertest(app.getHttpServer())
      .post('/api/v1/admin/curriculum-definitions/learning-domains')
      .set('Cookie', adminCookie)
      .send({ code: `TEST.ACT.DOMAIN.${Date.now()}`, name: 'Activity Test Domain' })
      .expect(201);

    const competency = await supertest(app.getHttpServer())
      .post('/api/v1/admin/curriculum-definitions/competency-definitions')
      .set('Cookie', adminCookie)
      .send({
        code: `TEST.ACT.COMPETENCY.${Date.now()}`,
        domainId: domain.body.id,
        title: 'Activity Test Competency',
      })
      .expect(201);

    const evidenceType = await supertest(app.getHttpServer())
      .post('/api/v1/admin/curriculum-definitions/evidence-type-definitions')
      .set('Cookie', adminCookie)
      .send({ code: `TEST.ACT.EVIDENCE.${Date.now()}`, name: 'Activity Test Evidence Type' })
      .expect(201);

    const activity = await supertest(app.getHttpServer())
      .post('/api/v1/admin/curriculum-definitions/activity-definitions')
      .set('Cookie', adminCookie)
      .send({
        code: `TEST.ACT.${Date.now()}`,
        name: 'Activity Test',
        supervisionRequired: true,
        evidenceRequirementMode: 'ALL',
      })
      .expect(201);
    expect(activity.body.evidenceRequirementMode).toBe('ALL');

    await supertest(app.getHttpServer())
      .post(`/api/v1/admin/curriculum-definitions/activity-definitions/${activity.body.id}/competencies`)
      .set('Cookie', adminCookie)
      .send({ competencyId: competency.body.id })
      .expect(201);

    await supertest(app.getHttpServer())
      .post(`/api/v1/admin/curriculum-definitions/activity-definitions/${activity.body.id}/evidence-types`)
      .set('Cookie', adminCookie)
      .send({ evidenceTypeId: evidenceType.body.id })
      .expect(201);

    const competenciesList = await supertest(app.getHttpServer())
      .get(`/api/v1/admin/curriculum-definitions/activity-definitions/${activity.body.id}/competencies`)
      .set('Cookie', adminCookie)
      .expect(200);
    expect(competenciesList.body).toHaveLength(1);

    const evidenceTypesList = await supertest(app.getHttpServer())
      .get(`/api/v1/admin/curriculum-definitions/activity-definitions/${activity.body.id}/evidence-types`)
      .set('Cookie', adminCookie)
      .expect(200);
    expect(evidenceTypesList.body).toHaveLength(1);

    const published = await supertest(app.getHttpServer())
      .patch(`/api/v1/admin/curriculum-definitions/activity-definitions/${activity.body.id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'PUBLISHED' })
      .expect(200);
    expect(published.body.status).toBe('PUBLISHED');
  });
});

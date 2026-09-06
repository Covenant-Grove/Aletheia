import { test, expect } from '@playwright/test';

// Visual-regression coverage for the shell (issue #24): the dashboard and
// settings pages, each authenticated via mocked routes so the screenshot is
// deterministic and never depends on a real backend. Runs only against the
// shell-visual-{1440,1024,390} projects in playwright.config.ts.

const userId = '11111111-1111-4111-a111-111111111111';
const familyId = '22222222-2222-4222-a222-222222222222';
const learnerId = '33333333-3333-4333-a333-333333333333';

async function mockAuthenticatedFamily(page: import('@playwright/test').Page) {
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        id: userId,
        email: 'guardian@aletheia.edu',
        fullName: 'Guardiã Visual',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    });
  });

  await page.route('**/api/v1/families/mine', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: [
        {
          id: familyId,
          name: 'Família Visual',
          countryCode: 'BRA',
          stateProvince: 'SP',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          members: [
            { id: 'member-1', familyId, userId, role: 'OWNER_GUARDIAN', createdAt: '2026-01-01T00:00:00.000Z' },
          ],
        },
      ],
    });
  });

  await page.route(`**/api/v1/families/${familyId}/learners**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: [
        {
          id: learnerId,
          familyId,
          firstName: 'Educando',
          lastName: 'Visual',
          preferredName: 'Educando Visual',
          birthDate: '2018-05-15',
          stage: 'PRIMARY_GRAMMAR',
          customGrade: null,
          avatarColor: '#3B82F6',
          specialNeeds: null,
          notes: null,
          archivedAt: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });
  });

  await page.route(`**/api/v1/families/${familyId}/dashboard**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        date: '2026-01-05',
        family: { id: familyId, name: 'Família Visual' },
        learners: [{ id: learnerId, displayName: 'Educando Visual' }],
        activeLearnerId: learnerId,
        journey: { completedMinutes: 45, targetMinutes: 180, completedLessons: 1, totalLessons: 2, daySequence: 1 },
        activities: [
          {
            id: '44444444-4444-4444-a444-444444444444',
            title: 'Gramática Latina: Primeira Declinação',
            subjectName: 'Latim',
            scheduledTime: '09:00',
            durationMinutes: 45,
            completed: true,
            type: 'lesson',
          },
        ],
      },
    });
  });

  await page.route(`**/api/v1/families/${familyId}/notifications`, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', json: [] });
  });
  await page.route(`**/api/v1/families/${familyId}/notifications/unread-count`, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', json: { count: 0 } });
  });
  await page.route(`**/api/v1/families/${familyId}/settings`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        id: 'settings-1',
        familyId,
        homeschoolName: 'Academia Visual',
        defaultGradingScale: 'MASTERY_QUALITATIVE',
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
        devotionalReminderTime: '07:00',
        dailyScheduleReminderTime: '08:30',
        attendanceReminderEnabled: true,
        emailNotificationsEnabled: true,
        inAppNotificationsEnabled: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    });
  });
  await page.route(`**/api/v1/families/${familyId}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        id: familyId,
        name: 'Família Visual',
        countryCode: 'BRA',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        members: [
          { id: 'member-1', familyId, userId, role: 'OWNER_GUARDIAN', createdAt: '2026-01-01T00:00:00.000Z' },
        ],
      },
    });
  });
  await page.route(`**/api/v1/families/${familyId}/invitations`, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', json: [] });
  });
  await page.route(`**/api/v1/families/${familyId}/export`, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', json: [] });
  });
  await page.route('**/api/v1/auth/audit-log', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', json: [] });
  });

  await page.addInitScript((id) => {
    window.localStorage.setItem('familyId', id);
  }, familyId);
}

const subjectId = '55555555-5555-4555-a555-555555555555';
const objectiveId = '66666666-6666-4666-a666-666666666666';
const lessonId = '77777777-7777-4777-a777-777777777777';
const recordId = '88888888-8888-4888-a888-888888888888';
const portfolioItemId = '99999999-9999-4999-a999-999999999999';
const reportId = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';

test.describe('Shell visual regression', () => {
  test('dashboard shell', async ({ page }) => {
    await mockAuthenticatedFamily(page);
    await page.goto('/');
    await expect(page.getByTestId('dashboard-content')).toBeVisible();
    await expect(page).toHaveScreenshot('dashboard-shell.png', { fullPage: true });
  });

  test('settings shell', async ({ page }) => {
    await mockAuthenticatedFamily(page);
    await page.goto('/settings');
    await expect(page.getByTestId('tab-general-settings')).toBeVisible();
    await expect(page).toHaveScreenshot('settings-shell.png', { fullPage: true });
  });

  test('curriculum shell', async ({ page }) => {
    await mockAuthenticatedFamily(page);

    await page.route(`**/api/v1/families/${familyId}/curriculum/academic-years`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: [
          {
            id: 'year-1',
            familyId,
            title: 'Ano Letivo 2026',
            startDate: '2026-01-01',
            endDate: '2026-12-15',
            isCurrent: true,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      });
    });
    await page.route(`**/api/v1/families/${familyId}/curriculum/subjects`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: [
          {
            id: subjectId,
            familyId,
            name: 'Latim',
            color: '#2563EB',
            description: 'Gramática latina clássica.',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      });
    });
    await page.route(`**/api/v1/families/${familyId}/curriculum/objectives**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: [
          {
            id: objectiveId,
            familyId,
            learnerId,
            subjectId,
            academicYearId: 'year-1',
            title: 'Dominar a primeira declinação',
            description: null,
            status: 'IN_PROGRESS',
            targetDate: null,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      });
    });
    await page.route(`**/api/v1/families/${familyId}/curriculum/plans**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          id: 'plan-1',
          familyId,
          learnerId,
          academicYearId: 'year-1',
          pedagogicalFramework: 'CLASSICAL_TRIVIUM',
          notes: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      });
    });

    await page.goto('/curriculum');
    await expect(page.getByTestId('curriculum-view')).toBeVisible();
    await expect(page.getByTestId(`subject-card-${subjectId}`)).toBeVisible();
    await expect(page).toHaveScreenshot('curriculum-shell.png', { fullPage: true });
  });

  test('schedule shell', async ({ page }) => {
    await mockAuthenticatedFamily(page);

    await page.route(`**/api/v1/families/${familyId}/curriculum/subjects`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: [{ id: subjectId, familyId, name: 'Latim', color: '#2563EB', description: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }],
      });
    });
    await page.route(`**/api/v1/families/${familyId}/curriculum/objectives`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', json: [] });
    });
    await page.route(`**/api/v1/families/${familyId}/schedule/agenda**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          date: '2026-01-05',
          dayOfWeek: 1,
          items: [
            {
              id: lessonId,
              type: 'LESSON',
              title: 'Gramática Latina: Primeira Declinação',
              subjectName: 'Latim',
              subjectColor: '#2563EB',
              startTime: '09:00',
              endTime: '09:45',
              status: 'PLANNED',
              isCompleted: false,
              learnerIds: [learnerId],
            },
          ],
        },
      });
    });
    await page.route(`**/api/v1/families/${familyId}/schedule/slots**`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', json: [] });
    });

    await page.goto('/schedule');
    await expect(page.getByTestId('daily-agenda-view')).toBeVisible();
    await expect(page.getByTestId(`agenda-item-${lessonId}`)).toBeVisible();
    await expect(page).toHaveScreenshot('schedule-shell.png', { fullPage: true });
  });

  test('records shell', async ({ page }) => {
    await mockAuthenticatedFamily(page);

    await page.route(`**/api/v1/families/${familyId}/curriculum/subjects`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: [{ id: subjectId, familyId, name: 'Latim', color: '#2563EB', description: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }],
      });
    });
    await page.route(`**/api/v1/families/${familyId}/curriculum/objectives`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', json: [] });
    });
    await page.route(`**/api/v1/families/${familyId}/records**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: [
          {
            id: recordId,
            familyId,
            learnerId,
            subjectId,
            type: 'PLANNED_LESSON',
            title: 'Avaliação de domínio: primeira declinação',
            description: null,
            date: '2026-01-05',
            durationMinutes: 45,
            masteryLevel: 'DEVELOPING',
            assessmentMethod: 'OBSERVATION',
            strengths: null,
            areasForGrowth: null,
            characterHabitGrowth: null,
            notes: null,
            objectiveIds: [],
            createdAt: '2026-01-05T00:00:00.000Z',
            updatedAt: '2026-01-05T00:00:00.000Z',
          },
        ],
      });
    });

    await page.goto('/records');
    await expect(page.getByTestId('records-feed-list')).toBeVisible();
    await expect(page).toHaveScreenshot('records-shell.png', { fullPage: true });
  });

  test('portfolio shell', async ({ page }) => {
    await mockAuthenticatedFamily(page);

    await page.route(`**/api/v1/families/${familyId}/curriculum/subjects`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: [{ id: subjectId, familyId, name: 'Latim', color: '#2563EB', description: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }],
      });
    });
    await page.route(`**/api/v1/families/${familyId}/records`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', json: [] });
    });
    await page.route(`**/api/v1/families/${familyId}/portfolio**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: [
          {
            id: portfolioItemId,
            familyId,
            learnerId,
            subjectId,
            learningRecordId: null,
            title: 'Caderno de Latim - Primeira Declinação',
            description: null,
            type: 'IMAGE',
            fileUrl: null,
            mimeType: 'image/png',
            textContent: null,
            capturedAt: '2026-01-05',
            isHighlight: true,
            tags: [],
            createdAt: '2026-01-05T00:00:00.000Z',
            updatedAt: '2026-01-05T00:00:00.000Z',
          },
        ],
      });
    });

    await page.goto('/portfolio');
    await expect(page.getByTestId('portfolio-gallery-grid')).toBeVisible();
    await expect(page).toHaveScreenshot('portfolio-shell.png', { fullPage: true });
  });

  test('attendance shell', async ({ page }) => {
    await mockAuthenticatedFamily(page);

    await page.route(`**/api/v1/families/${familyId}/attendance/requirements`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', json: [] });
    });
    await page.route(`**/api/v1/families/${familyId}/attendance**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: [
          {
            id: 'attendance-1',
            familyId,
            learnerId,
            date: '2026-01-05',
            status: 'PRESENT',
            hoursLogged: 5,
            notes: null,
            createdAt: '2026-01-05T00:00:00.000Z',
            updatedAt: '2026-01-05T00:00:00.000Z',
          },
        ],
      });
    });

    await page.goto('/attendance');
    await expect(page.getByTestId('attendance-table-container')).toBeVisible();
    await expect(page).toHaveScreenshot('attendance-shell.png', { fullPage: true });
  });

  test('reports shell', async ({ page }) => {
    await mockAuthenticatedFamily(page);

    await page.route(`**/api/v1/families/${familyId}/reports**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: [
          {
            id: reportId,
            familyId,
            learnerId,
            type: 'ACADEMIC_TRANSCRIPT',
            title: 'Histórico Escolar - Ano Letivo 2026',
            gradingScale: 'MASTERY_QUALITATIVE',
            generatedByUserId: userId,
            generatedAt: '2026-01-05T00:00:00.000Z',
            documentHash: 'abc123',
            createdAt: '2026-01-05T00:00:00.000Z',
            updatedAt: '2026-01-05T00:00:00.000Z',
          },
        ],
      });
    });

    await page.goto('/reports');
    await expect(page.getByTestId('reports-grid')).toBeVisible();
    await expect(page).toHaveScreenshot('reports-shell.png', { fullPage: true });
  });
});

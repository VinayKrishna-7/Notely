import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Note } from '../models/Note';
import { Tag } from '../models/Tag';

describe('Notely API Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let secondUserToken: string;
  let secondUserId: string;

  beforeAll(async () => {
    // Set NODE_ENV to test to avoid terminal logs during tests
    process.env.NODE_ENV = 'test';
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Note.deleteMany({});
    await Tag.deleteMany({});

    // Create primary test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@notely.app',
        password: 'Password123!',
      });
    authToken = res.body.data.token;
    userId = res.body.data.user._id;

    // Create secondary test user for authorization tests
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Second User',
        email: 'second@notely.app',
        password: 'Password123!',
      });
    secondUserToken = res2.body.data.token;
    secondUserId = res2.body.data.user._id;
  });

  // 1. Health check
  it('GET /api/health returns healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  // 2. Authentication
  describe('Authentication Endpoints', () => {
    it('POST /api/auth/register fails on duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate User',
          email: 'test@notely.app',
          password: 'Password123!',
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login authenticates with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@notely.app',
          password: 'Password123!',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('test@notely.app');
    });

    it('POST /api/auth/login rejects incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@notely.app',
          password: 'WrongPassword!',
        });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me returns current user profile with valid JWT', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Test User');
    });

    it('GET /api/auth/me rejects request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('PUT /api/auth/profile updates clockPreferences and persists cleanly', async () => {
      const updateRes = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clockPreferences: {
            enabled: true,
            style: 'productivity',
            timeFormat: '24h',
            showSeconds: true,
            showDate: true,
            accent: 'accent',
          },
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.clockPreferences.style).toBe('productivity');
      expect(updateRes.body.data.clockPreferences.timeFormat).toBe('24h');
      expect(updateRes.body.data.clockPreferences.showSeconds).toBe(true);
      expect(updateRes.body.data.clockPreferences.accent).toBe('accent');

      // Verify persistence via GET /api/auth/me
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.data.clockPreferences.style).toBe('productivity');
    });

    it('PUT /api/auth/profile rejects invalid clock style', async () => {
      const invalidRes = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clockPreferences: {
            style: 'invalid-style-xyz',
          },
        });

      expect(invalidRes.status).toBe(400);
      expect(invalidRes.body.success).toBe(false);
    });
  });

  // 3. Notes CRUD & Operations
  describe('Notes Endpoints', () => {
    it('POST /api/notes creates a new note', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'My First Test Note',
          content: 'Here is some # markdown content',
          tags: ['react', 'test'],
          color: 'emerald',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('My First Test Note');
      expect(res.body.data.tags).toContain('react');
      expect(res.body.data.color).toBe('emerald');
    });

    it('GET /api/notes fetches user notes with search query', async () => {
      // Create two notes
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'React Hooks Guide', content: 'Learn useState and useEffect' });

      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Cooking Recipe', content: 'Pasta ingredients' });

      const searchRes = await request(app)
        .get('/api/notes?search=hooks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.data.length).toBe(1);
      expect(searchRes.body.data[0].title).toBe('React Hooks Guide');
    });

    it('PATCH /api/notes/:id/favorite toggles favorite status', async () => {
      const createRes = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Favorite Note', content: 'Starred' });

      const noteId = createRes.body.data._id;

      const favRes = await request(app)
        .patch(`/api/notes/${noteId}/favorite`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(favRes.status).toBe(200);
      expect(favRes.body.data.isFavorite).toBe(true);

      const unFavRes = await request(app)
        .patch(`/api/notes/${noteId}/favorite`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(unFavRes.status).toBe(200);
      expect(unFavRes.body.data.isFavorite).toBe(false);
    });

    it('DELETE /api/notes/:id moves note to trash (soft delete)', async () => {
      const createRes = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Trash Note', content: 'Going to trash' });

      const noteId = createRes.body.data._id;

      const deleteRes = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.data.isDeleted).toBe(true);

      // Verify not in default list
      const listRes = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${authToken}`);
      expect(listRes.body.data.length).toBe(0);

      // Verify in trash list
      const trashRes = await request(app)
        .get('/api/notes?isDeleted=true')
        .set('Authorization', `Bearer ${authToken}`);
      expect(trashRes.body.data.length).toBe(1);
    });

    it('PATCH /api/notes/:id/restore restores note from trash', async () => {
      const createRes = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'To Restore', content: 'Text' });

      const noteId = createRes.body.data._id;
      await request(app).delete(`/api/notes/${noteId}`).set('Authorization', `Bearer ${authToken}`);

      const restoreRes = await request(app)
        .patch(`/api/notes/${noteId}/restore`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body.data.isDeleted).toBe(false);
    });

    it('POST /api/notes/:id/duplicate duplicates an existing note', async () => {
      const createRes = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Original Note', content: 'Original text', tags: ['orig'] });

      const noteId = createRes.body.data._id;

      const dupRes = await request(app)
        .post(`/api/notes/${noteId}/duplicate`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(dupRes.status).toBe(201);
      expect(dupRes.body.data.title).toBe('Original Note (Copy)');
      expect(dupRes.body.data.content).toBe('Original text');
    });

    // 4. Security & Data Isolation
    it('Security: User cannot access another users note', async () => {
      const createRes = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'User 1 Private Note', content: 'Secret' });

      const noteId = createRes.body.data._id;

      // Try accessing with second user's token
      const forbiddenGet = await request(app)
        .get(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${secondUserToken}`);

      expect(forbiddenGet.status).toBe(404);

      // Try deleting with second user's token
      const forbiddenDelete = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${secondUserToken}`);

      expect(forbiddenDelete.status).toBe(404);
    });

    // 5. Version History Tests
    it('Version History: snapshots on edit and restores cleanly', async () => {
      const createRes = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Versioned Note', content: 'Initial Text' });

      const noteId = createRes.body.data._id;

      // Update the note
      await request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Versioned Note', content: 'Updated Text' });

      // Fetch versions
      const versionsRes = await request(app)
        .get(`/api/notes/${noteId}/versions`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(versionsRes.status).toBe(200);
      expect(versionsRes.body.data.length).toBeGreaterThanOrEqual(1);

      const firstVersion = versionsRes.body.data[versionsRes.body.data.length - 1];
      expect(firstVersion.content).toBe('Initial Text');

      // Restore first version
      const restoreRes = await request(app)
        .post(`/api/notes/${noteId}/versions/${firstVersion._id}/restore`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body.data.content).toBe('Initial Text');
    });

    // 6. Backlinks & Note Linking Tests
    it('Backlinks: finds notes referencing [[Target Note]]', async () => {
      // Create target note
      const targetRes = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'System Architecture', content: 'Overview of system' });

      const targetId = targetRes.body.data._id;

      // Create referencing note
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Deployment Plan',
          content: 'See [[System Architecture]] for details on infra.',
        });

      // Query backlinks for target note
      const backlinkRes = await request(app)
        .get(`/api/notes/${targetId}/backlinks`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(backlinkRes.status).toBe(200);
      expect(backlinkRes.body.data.length).toBe(1);
      expect(backlinkRes.body.data[0].title).toBe('Deployment Plan');
    });

    // 7. Daily Notes Tests
    it('Daily Notes: creates and retrieves daily note for date', async () => {
      const dailyRes = await request(app)
        .get('/api/notes/daily/2026-09-12')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 201]).toContain(dailyRes.status);
      expect(dailyRes.body.data.isDaily).toBe(true);
      expect(dailyRes.body.data.dailyDate).toBe('2026-09-12');

      // Verify idempotency (second request retrieves same note)
      const secondDailyRes = await request(app)
        .get('/api/notes/daily/2026-09-12')
        .set('Authorization', `Bearer ${authToken}`);

      expect(secondDailyRes.body.data._id).toBe(dailyRes.body.data._id);

      // Verify daily dates list
      const datesRes = await request(app)
        .get('/api/notes/daily-dates')
        .set('Authorization', `Bearer ${authToken}`);

      expect(datesRes.status).toBe(200);
      expect(datesRes.body.data.some((d: any) => d.date === '2026-09-12')).toBe(true);
    });

    // 8. Reorder Notes Test
    it('Reorder Notes: updates sortOrder for multiple notes', async () => {
      const note1 = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Note 1', content: 'First' });

      const note2 = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Note 2', content: 'Second' });

      const id1 = note1.body.data._id;
      const id2 = note2.body.data._id;

      const reorderRes = await request(app)
        .patch('/api/notes/reorder')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ orderedIds: [id2, id1] });

      expect(reorderRes.status).toBe(200);
      expect(reorderRes.body.data.updatedCount).toBe(2);

      const listRes = await request(app)
        .get('/api/notes?sort=order_asc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data[0]._id).toBe(id2);
      expect(listRes.body.data[1]._id).toBe(id1);
    });

    // 9. Advanced Search Token Filter
    it('Advanced Search: filters by search tokens tag: and is:pinned', async () => {
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'TypeScript Notes', content: 'Static typing', tags: ['typescript'], isPinned: true });

      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'JavaScript Notes', content: 'Dynamic typing', tags: ['javascript'], isPinned: false });

      const tokenSearch = await request(app)
        .get('/api/notes?search=tag:typescript is:pinned')
        .set('Authorization', `Bearer ${authToken}`);

      expect(tokenSearch.status).toBe(200);
      expect(tokenSearch.body.data.length).toBe(1);
      expect(tokenSearch.body.data[0].title).toBe('TypeScript Notes');
    });
  });

  // 10. Tags & Stats
  describe('Tags & Stats Endpoints', () => {
    it('POST /api/tags creates a tag and GET /api/tags returns note counts', async () => {
      await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'javascript' });

      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'JS Tips', content: 'Clean code', tags: ['javascript'] });

      const tagsRes = await request(app)
        .get('/api/tags')
        .set('Authorization', `Bearer ${authToken}`);

      expect(tagsRes.status).toBe(200);
      const jsTag = tagsRes.body.data.find((t: any) => t.name === 'javascript');
      expect(jsTag).toBeDefined();
      expect(jsTag.noteCount).toBe(1);
    });

    it('GET /api/stats returns workspace statistics with activity cadence and writing streak', async () => {
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Starred Note', content: 'Content with words', isFavorite: true });

      const statsRes = await request(app)
        .get('/api/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(statsRes.status).toBe(200);
      expect(statsRes.body.data.totalNotes).toBe(1);
      expect(statsRes.body.data.favoritesCount).toBe(1);
      expect(statsRes.body.data.activityByDay).toBeDefined();
      expect(statsRes.body.data.activityByDay.length).toBe(7);
      expect(statsRes.body.data.writingStreak).toBeGreaterThanOrEqual(1);
    });
  });
});

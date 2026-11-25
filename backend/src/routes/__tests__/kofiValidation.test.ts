import express from 'express';
import request from 'supertest';
import { describe, expect, it, jest } from '@jest/globals';

const recordDonation = jest.fn();
jest.unstable_mockModule('../../services/donationService.js', () => ({ recordDonation }));
const { default: kofiRoutes } = await import('../kofi.js');
const app = express();
app.use('/', kofiRoutes);

describe('retired Ko-fi webhook', () => {
  it.each(['true', 'false'])('rejects donations regardless of legacy flag %s', async (flag) => {
    const previous = process.env.DONATIONS_ENABLED;
    process.env.DONATIONS_ENABLED = flag;
    try {
      const response = await request(app)
        .post('/')
        .type('form')
        .send({ data: JSON.stringify({ email: 'fixture@example.invalid' }) });
      expect(response.status).toBe(410);
      expect(response.text).not.toContain('fixture@example.invalid');
      expect(recordDonation).not.toHaveBeenCalled();
    } finally {
      if (previous === undefined) delete process.env.DONATIONS_ENABLED;
      else process.env.DONATIONS_ENABLED = previous;
    }
  });
});

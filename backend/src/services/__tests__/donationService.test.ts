import { describe, expect, it, jest } from '@jest/globals';

const query = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const getConnection = jest.fn();
jest.unstable_mockModule('../../db/connection.js', () => ({
  pool: { query, getConnection },
  mudPool: { query },
}));

const { findAccountByEmail, recordDonation } = await import('../donationService.js');

const donation = {
  message_id: 'message-123456789012',
  type: 'Donation',
  amount: '25.50',
  currency: 'USD',
  from_name: 'Supporter',
  email: 'supporter@example.invalid',
  message: 'Thank you',
  is_public: true,
  timestamp: '2026-08-31T00:00:00.000Z',
  is_subscription_payment: false,
  is_first_subscription_payment: false,
  tier_name: null,
};

describe('retired donation persistence boundary', () => {
  it('does not look up donor email or open a write transaction', async () => {
    await expect(findAccountByEmail(donation.email)).resolves.toBeNull();
    await expect(recordDonation(donation)).rejects.toThrow('Donations are no longer supported');
    expect(query).not.toHaveBeenCalled();
    expect(getConnection).not.toHaveBeenCalled();
  });
});

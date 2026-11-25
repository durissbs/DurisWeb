import { pool as webPool } from '../db/connection.js';
import type { RowDataPacket } from 'mysql2';
import { DonationDeliveryConfigurationError } from '../utils/donationEvent.js';

export interface KofiDonation {
  message_id: string;
  type: string;
  amount: string;
  currency: string;
  from_name: string;
  email: string;
  message: string | null;
  is_public: boolean;
  timestamp: string;
  is_subscription_payment: boolean;
  is_first_subscription_payment: boolean;
  tier_name: string | null;
}

// Compatibility for older import callers: never look up or associate an address.
export async function findAccountByEmail(_email: string): Promise<string | null> {
  return null;
}

export async function getPrimaryCharacter(_accountName: string): Promise<string | null> {
  return null;
}

export interface DonationRecordResult {
  duplicate: boolean;
  eventId: string | null;
  accountName: string | null;
  characterName: string | null;
  amount: number;
  amountCents: number;
}

/** Reject legacy import callers without reading or persisting provider data. */
export async function recordDonation(_donation: KofiDonation): Promise<DonationRecordResult> {
  throw new DonationDeliveryConfigurationError('Donations are no longer supported');
}

/**
 * Get the WebService-owned donation total for an account.
 */
export async function getAccountDonationTotal(accountName: string): Promise<number> {
  const [rows] = await webPool.query<RowDataPacket[]>(
    'SELECT total_cents FROM web_donation_totals WHERE account_name = ?',
    [accountName],
  );
  return rows.length > 0 ? Number(rows[0].total_cents) / 100 : 0;
}

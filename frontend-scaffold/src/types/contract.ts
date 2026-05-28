import { mapContractResponse } from "../helpers/format";

/**
 * Raw profile shape returned by the Soroban contract before key mapping.
 * Field names match the Rust struct fields (snake_case).
 */
export interface RawProfile {
  owner: string;
  username: string;
  display_name: string;
  bio: string;
  image_url: string;
  x_handle: string;
  x_followers: number;
  x_engagement_avg: number;
  credit_score: number;
  total_tips_received: string;
  total_tips_count: number;
  balance: string;
  registered_at: number;
  updated_at: number;
}

/** Raw tip record as returned by the contract before key mapping. */
export interface RawTip {
  id: number;
  tipper: string;
  creator: string;
  amount: string;
  message: string;
  timestamp: number;
}

/** Raw leaderboard entry before key mapping. */
export interface RawLeaderboardEntry {
  address: string;
  username: string;
  total_tips_received: string;
  credit_score: number;
}

/** Raw contract stats before key mapping. */
export interface RawContractStats {
  total_creators: number;
  total_tips_count: number;
  total_tips_volume: string;
  total_fees_collected: string;
  fee_bps: number;
}

/** Profile data from the Tipz contract */
export interface Profile {
  owner: string;
  username: string;
  displayName: string;
  bio: string;
  imageUrl: string;
  xHandle: string;
  xFollowers: number;
  xEngagementAvg: number;
  creditScore: number;
  totalTipsReceived: string; // i128 as string
  totalTipsCount: number;
  balance: string; // i128 as string
  registeredAt: number;
  updatedAt: number;
}

/** Tip record from the contract */
export interface Tip {
  id: number;
  tipper: string;
  creator: string;
  amount: string; // i128 as string
  message: string;
  timestamp: number;
}

/** Leaderboard entry */
export interface LeaderboardEntry {
  address: string;
  username: string;
  totalTipsReceived: string;
  creditScore: number;
  score?: number; // Optional alias for backward compatibility / tests
}

/** Global contract statistics */
export interface ContractStats {
  totalCreators: number;
  totalTipsCount: number;
  totalTipsVolume: string;
  totalFeesCollected: string;
  feeBps: number;
}

/** Credit score tiers */
export type CreditTier = 'new' | 'bronze' | 'silver' | 'gold' | 'diamond';

export const getCreditTier = (score: number): CreditTier => {
  if (score >= 80) return 'diamond';
  if (score >= 60) return 'gold';
  if (score >= 40) return 'silver';
  if (score >= 20) return 'bronze';
  return 'new';
};

/** Contract interface version */
export const CONTRACT_INTERFACE_VERSION = '1.0.0';

/**
 * Parsers that transform raw contract responses into strongly-typed frontend objects.
 * Standardizes key case from snake_case to camelCase.
 */

export function parseProfile(raw: any): Profile {
  if (!raw) {
    throw new Error('Invalid raw profile: null or undefined');
  }
  return mapContractResponse<Profile>(raw);
}

export function parseLeaderboardEntry(raw: any): LeaderboardEntry {
  if (!raw) {
    throw new Error('Invalid raw leaderboard entry: null or undefined');
  }
  const parsed = mapContractResponse<any>(raw);
  if (parsed.score !== undefined && parsed.creditScore === undefined) {
    parsed.creditScore = parsed.score;
  } else if (parsed.creditScore !== undefined && parsed.score === undefined) {
    parsed.score = parsed.creditScore;
  }
  return parsed as LeaderboardEntry;
}

export function parseTip(raw: any): Tip {
  if (!raw) {
    throw new Error('Invalid raw tip: null or undefined');
  }
  return mapContractResponse<Tip>(raw);
}

export function parseContractStats(raw: any): ContractStats {
  if (!raw) {
    throw new Error('Invalid raw contract stats: null or undefined');
  }
  return mapContractResponse<ContractStats>(raw);
}

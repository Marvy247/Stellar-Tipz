import { describe, it, expect } from "vitest";
import {
  parseProfile,
  parseLeaderboardEntry,
  parseTip,
  parseContractStats,
  CONTRACT_INTERFACE_VERSION,
} from "../../types/contract";

describe("Contract interface tests", () => {
  it("Profile type matches contract response", () => {
    const contractResponse = {
      username: "alice",
      display_name: "Alice",
      x_handle: "alice_x",
      registered_at: 1234567890,
    };
    const parsed = parseProfile(contractResponse);
    expect(parsed).toEqual({
      username: "alice",
      displayName: "Alice",
      xHandle: "alice_x",
      registeredAt: 1234567890,
    });
  });

  it("Leaderboard entry matches contract response", () => {
    const entry = { address: "GABCD", username: "alice", score: 500 };
    const parsed = parseLeaderboardEntry(entry);
    expect(parsed).toHaveProperty("address");
    expect(parsed).toHaveProperty("username");
    expect(parsed).toHaveProperty("score");
  });

  it("Tip type matches contract response", () => {
    const rawTip = {
      id: 1,
      tipper: "GTIpperAddress",
      creator: "GCreatorAddress",
      amount: "10000000",
      message: "Keep up the great work!",
      timestamp: 1682226000,
    };
    const parsed = parseTip(rawTip);
    expect(parsed).toEqual({
      id: 1,
      tipper: "GTIpperAddress",
      creator: "GCreatorAddress",
      amount: "10000000",
      message: "Keep up the great work!",
      timestamp: 1682226000,
    });
  });

  it("Contract stats type matches contract response", () => {
    const rawStats = {
      total_creators: 15,
      total_tips_count: 142,
      total_tips_volume: "5000000000",
      total_fees_collected: "50000000",
      fee_bps: 100,
    };
    const parsed = parseContractStats(rawStats);
    expect(parsed).toEqual({
      totalCreators: 15,
      totalTipsCount: 142,
      totalTipsVolume: "5000000000",
      totalFeesCollected: "50000000",
      feeBps: 100,
    });
  });

  it("Validates contract interface version matches expected spec", () => {
    expect(CONTRACT_INTERFACE_VERSION).toBe("1.0.0");
  });
});

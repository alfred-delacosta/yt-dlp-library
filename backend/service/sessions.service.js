import crypto from "node:crypto";
import { generateRefreshToken, hashOpaqueToken, refreshTtlMs } from "../utils/authTokens.js";

function userAgentOf(userAgent) {
  if (!userAgent) return null;
  return String(userAgent).replace(/[\u0000-\u001F\u007F]/g, "").slice(0, 255) || null;
}

async function insertToken(store, { userId, familyId, userAgent }) {
  const { raw, hash } = generateRefreshToken();
  const expiresAt = new Date(Date.now() + refreshTtlMs());
  const id = await store.insert({
    userId,
    familyId,
    tokenHash: hash,
    expiresAt,
    userAgent: userAgentOf(userAgent),
  });
  return { id, raw, familyId, expiresAt };
}

export function createSessionService(store) {
  return {
    async issue(userId, userAgent) {
      return insertToken(store, {
        userId,
        familyId: crypto.randomUUID(),
        userAgent,
      });
    },

    async rotate(rawToken, userAgent) {
      if (!rawToken) return { ok: false, reason: "missing" };
      const current = await store.findByHash(hashOpaqueToken(rawToken));
      if (!current) return { ok: false, reason: "missing" };

      if (current.revokedAt) {
        return reuseResult(store, current);
      }

      if (new Date(current.expiresAt).getTime() <= Date.now()) {
        return { ok: false, reason: "expired" };
      }

      const next = await insertToken(store, {
        userId: current.userId,
        familyId: current.familyId,
        userAgent: userAgent || current.userAgent,
      });
      const won = await store.markReplaced(current.id, next.id);
      if (won) {
        return {
          ok: true,
          userId: current.userId,
          refreshToken: next.raw,
          familyId: current.familyId,
          sessionId: next.id,
        };
      }

      await store.markReplaced(next.id, null);
      const latest = await store.findByHash(hashOpaqueToken(rawToken));
      return reuseResult(store, latest || current);
    },

    async revokeRaw(rawToken) {
      if (!rawToken) return;
      const current = await store.findByHash(hashOpaqueToken(rawToken));
      if (!current || current.revokedAt) return;
      await store.markReplaced(current.id, null);
    },

    async revokeOthers(userId, rawToken) {
      const current = rawToken ? await store.findByHash(hashOpaqueToken(rawToken)) : null;
      if (!current || current.revokedAt || Number(current.userId) !== Number(userId)) {
        return { ok: false, reason: "missing" };
      }
      await store.revokeAllForUser(userId, current.id);
      return { ok: true };
    },

    async revokeUser(userId) {
      await store.revokeAllForUser(userId, null);
    },

    async list(userId, rawToken) {
      const current = rawToken ? await store.findByHash(hashOpaqueToken(rawToken)) : null;
      const rows = await store.listActive(userId);
      return rows.map((row) => ({
        id: row.id,
        createdAt: row.createdAt,
        expiresAt: row.expiresAt,
        userAgent: row.userAgent,
        current: current?.id === row.id,
      }));
    },

    async familyIsActive(familyId) {
      if (!familyId) return false;
      return store.familyHasActive(familyId);
    },
  };
}

async function reuseResult(store, current) {
  await store.revokeFamily(current.familyId);
  return { ok: false, reason: "reused" };
}

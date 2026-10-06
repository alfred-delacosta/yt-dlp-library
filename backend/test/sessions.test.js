import assert from "node:assert/strict";
import test from "node:test";
import { createSessionService } from "../service/sessions.service.js";

function createMemoryStore() {
  const rows = [];
  let nextId = 1;
  return {
    rows,
    async insert(row) {
      const id = nextId++;
      rows.push({
        id,
        userId: row.userId,
        familyId: row.familyId,
        tokenHash: row.tokenHash,
        expiresAt: row.expiresAt,
        revokedAt: null,
        replacedBy: null,
        userAgent: row.userAgent,
        createdAt: new Date(),
      });
      return id;
    },
    async findByHash(tokenHash) {
      return rows.find((row) => row.tokenHash === tokenHash) ?? null;
    },
    async markReplaced(id, replacedBy) {
      const row = rows.find((item) => item.id === id);
      if (!row || row.revokedAt) return false;
      row.revokedAt = new Date();
      row.replacedBy = replacedBy;
      return true;
    },
    async revokeFamily(familyId) {
      const now = new Date();
      for (const row of rows) {
        if (row.familyId === familyId && !row.revokedAt) row.revokedAt = now;
      }
    },
    async revokeAllForUser(userId, exceptId) {
      const now = new Date();
      for (const row of rows) {
        if (row.userId === userId && !row.revokedAt && row.id !== exceptId) row.revokedAt = now;
      }
    },
    async listActive(userId) {
      const now = Date.now();
      return rows.filter((row) => row.userId === userId && !row.revokedAt && new Date(row.expiresAt).getTime() > now);
    },
    async familyHasActive(familyId) {
      const now = Date.now();
      return rows.some((row) => row.familyId === familyId && !row.revokedAt && new Date(row.expiresAt).getTime() > now);
    },
  };
}

test("refresh rotation replaces the presented token and reuse revokes the family", async () => {
  const store = createMemoryStore();
  const sessions = createSessionService(store);
  const issued = await sessions.issue(7, "Browser A");
  const rotated = await sessions.rotate(issued.raw, "Browser A");

  assert.equal(rotated.ok, true);
  assert.notEqual(rotated.refreshToken, issued.raw);
  assert.equal(rotated.familyId, issued.familyId);

  const reused = await sessions.rotate(issued.raw, "Browser A");
  assert.equal(reused.ok, false);
  assert.equal(reused.reason, "reused");

  const followUp = await sessions.rotate(rotated.refreshToken, "Browser A");
  assert.equal(followUp.ok, false);
  assert.equal(await sessions.familyIsActive(issued.familyId), false);
});

test("an expired refresh token does not revoke a newer token in the family", async () => {
  const store = createMemoryStore();
  const sessions = createSessionService(store);
  const issued = await sessions.issue(7, "Browser A");
  const rotated = await sessions.rotate(issued.raw, "Browser A");
  const oldRow = store.rows.find((row) => row.id === issued.id);
  oldRow.revokedAt = null;
  oldRow.replacedBy = null;
  oldRow.expiresAt = new Date(Date.now() - 1000);

  const expired = await sessions.rotate(issued.raw, "Browser A");
  assert.deepEqual(expired, { ok: false, reason: "expired" });
  assert.equal(await sessions.familyIsActive(rotated.familyId), true);
});

test("logging out other sessions keeps the presented session", async () => {
  const store = createMemoryStore();
  const sessions = createSessionService(store);
  const current = await sessions.issue(3, "This device");
  const other = await sessions.issue(3, "Other device");

  const revoked = await sessions.revokeOthers(3, current.raw);
  assert.equal(revoked.ok, true);

  const listed = await sessions.list(3, current.raw);
  assert.equal(listed.length, 1);
  assert.equal(listed[0].current, true);
  assert.equal(listed[0].userAgent, "This device");

  const otherRefresh = await sessions.rotate(other.raw, "Other device");
  assert.equal(otherRefresh.ok, false);
  const currentRefresh = await sessions.rotate(current.raw, "This device");
  assert.equal(currentRefresh.ok, true);
});

test("parallel reuse of one refresh token revokes the family", async () => {
  const store = createMemoryStore();
  const sessions = createSessionService(store);
  const issued = await sessions.issue(9, "Browser");
  const results = await Promise.all([
    sessions.rotate(issued.raw, "one"),
    sessions.rotate(issued.raw, "two"),
  ]);

  assert.equal(results.filter((result) => result.ok).length, 1);
  assert.equal(results.filter((result) => result.reason === "reused").length, 1);
  assert.equal(await sessions.familyIsActive(issued.familyId), false);
});

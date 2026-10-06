import { ensureAuthSchema, mysqlSessionStore } from "../db/refreshTokenStore.js";
import { createSessionService } from "./sessions.service.js";

export const sessions = createSessionService(mysqlSessionStore);

async function ready(work) {
  await ensureAuthSchema();
  return work();
}

export function issueSession(userId, userAgent) {
  return ready(() => sessions.issue(userId, userAgent));
}

export function rotateSession(rawToken, userAgent) {
  return ready(() => sessions.rotate(rawToken, userAgent));
}

export function revokeSession(rawToken) {
  return ready(() => sessions.revokeRaw(rawToken));
}

export function revokeOtherSessions(userId, rawToken) {
  return ready(() => sessions.revokeOthers(userId, rawToken));
}

export function revokeUserSessions(userId) {
  return ready(() => sessions.revokeUser(userId));
}

export function listSessions(userId, rawToken) {
  return ready(() => sessions.list(userId, rawToken));
}

export function familyIsActive(familyId) {
  return ready(() => sessions.familyIsActive(familyId));
}

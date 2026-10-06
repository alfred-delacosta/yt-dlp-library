import crypto from "node:crypto";
import argon2 from "argon2";
import "@dotenvx/dotenvx/config";

function pepper() {
  const raw = process.env.ARGON2_SECRET;
  if (!raw) throw new Error("ARGON2_SECRET is not set");
  return Buffer.from(raw);
}

function argonOptions() {
  return {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
    secret: pepper(),
  };
}

let dummyHashPromise;

function dummyHash() {
  if (!dummyHashPromise) {
    dummyHashPromise = argon2.hash(crypto.randomBytes(32).toString("hex"), argonOptions());
  }
  return dummyHashPromise;
}

export async function hashPassword(password) {
  return argon2.hash(password, argonOptions());
}

export async function verifyPassword(passwordHash, password) {
  const secret = pepper();
  if (!passwordHash) {
    await argon2.verify(await dummyHash(), password, { secret });
    return false;
  }
  try {
    return await argon2.verify(passwordHash, password, { secret });
  } catch {
    await argon2.verify(await dummyHash(), password, { secret });
    return false;
  }
}

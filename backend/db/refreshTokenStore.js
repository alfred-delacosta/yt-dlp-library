import { pool } from "./db.pool.js";

const CREATE_REFRESH_TOKENS = `
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  family_id CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  replaced_by BIGINT NULL,
  user_agent VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY token_hash_unique (token_hash),
  KEY family_idx (family_id),
  KEY user_idx (user_id),
  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB
`;

let schemaReady = false;
let schemaPromise = null;

async function ensureAuthSchemaOnce() {
  await pool.query(CREATE_REFRESH_TOKENS);
  await pool.query("ALTER TABLE users MODIFY resetPasswordToken VARCHAR(64) NULL");
  schemaReady = true;
}

export function ensureAuthSchema() {
  if (schemaReady) return Promise.resolve();
  if (!schemaPromise) {
    schemaPromise = ensureAuthSchemaOnce()
      .catch((error) => {
        const missingParent = [
          "ER_NO_SUCH_TABLE",
          "ER_BAD_DB_ERROR",
          "ER_FK_CANNOT_OPEN_PARENT",
          "ER_CANNOT_ADD_FOREIGN",
        ].includes(error.code);
        if (missingParent) return;
        throw error;
      })
      .finally(() => {
        schemaPromise = null;
      });
  }
  return schemaPromise;
}

function mapRow(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    userId: Number(row.userId),
    familyId: row.familyId,
    tokenHash: row.tokenHash,
    expiresAt: row.expiresAt,
    revokedAt: row.revokedAt,
    replacedBy: row.replacedBy == null ? null : Number(row.replacedBy),
    userAgent: row.userAgent,
    createdAt: row.createdAt,
  };
}

const ROW_COLUMNS = `id, user_id AS userId, family_id AS familyId, token_hash AS tokenHash,
  expires_at AS expiresAt, revoked_at AS revokedAt, replaced_by AS replacedBy,
  user_agent AS userAgent, created_at AS createdAt`;

export const mysqlSessionStore = {
  async insert(row) {
    const [result] = await pool.execute(
      `INSERT INTO refresh_tokens (user_id, family_id, token_hash, expires_at, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
      [row.userId, row.familyId, row.tokenHash, row.expiresAt, row.userAgent]
    );
    return Number(result.insertId);
  },

  async findByHash(tokenHash) {
    const [rows] = await pool.execute(
      `SELECT ${ROW_COLUMNS} FROM refresh_tokens WHERE token_hash = ? LIMIT 1`,
      [tokenHash]
    );
    return mapRow(rows[0]);
  },

  async markReplaced(id, replacedBy) {
    const [result] = await pool.execute(
      `UPDATE refresh_tokens
       SET revoked_at = NOW(), replaced_by = ?
       WHERE id = ? AND revoked_at IS NULL`,
      [replacedBy, id]
    );
    return result.affectedRows > 0;
  },

  async revokeFamily(familyId) {
    await pool.execute(
      `UPDATE refresh_tokens SET revoked_at = NOW() WHERE family_id = ? AND revoked_at IS NULL`,
      [familyId]
    );
  },

  async revokeAllForUser(userId, exceptId) {
    if (exceptId) {
      await pool.execute(
        `UPDATE refresh_tokens
         SET revoked_at = NOW()
         WHERE user_id = ? AND revoked_at IS NULL AND id <> ?`,
        [userId, exceptId]
      );
      return;
    }
    await pool.execute(
      `UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL`,
      [userId]
    );
  },

  async listActive(userId) {
    const [rows] = await pool.execute(
      `SELECT ${ROW_COLUMNS}
       FROM refresh_tokens
       WHERE user_id = ? AND revoked_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows.map(mapRow);
  },

  async familyHasActive(familyId) {
    const [rows] = await pool.execute(
      `SELECT id FROM refresh_tokens
       WHERE family_id = ? AND revoked_at IS NULL AND expires_at > NOW()
       LIMIT 1`,
      [familyId]
    );
    return rows.length > 0;
  },
};

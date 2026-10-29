export const createVideosTable = 'CREATE TABLE videos (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, name VARCHAR(500) NOT NULL, description TEXT, ext VARCHAR(10), downloadDate DATETIME, link VARCHAR(500), type INT, videoPath TEXT, serverPath TEXT, subtitles LONGTEXT, subtitlesFile TEXT, userId INT, CONSTRAINT user_video_id FOREIGN KEY (userId) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION);'

export const createThumbnailsTable = 'CREATE TABLE thumbnails (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, videoId INT, name VARCHAR(500) NOT NULL, thumbnailPath TEXT, serverPath TEXT, CONSTRAINT fk_videoId FOREIGN KEY (videoId) REFERENCES videos(id) ON DELETE CASCADE)';

export const createMP3sTable = "CREATE TABLE mp3s (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, name VARCHAR(500) NOT NULL, description TEXT, downloadDate DATETIME, link VARCHAR(150), mp3Path TEXT, serverPath TEXT, userId INT, CONSTRAINT user_mp3_id FOREIGN KEY (userId) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION)";

export const createUsersTable = `
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(100) NOT NULL,
  password TEXT NOT NULL,
  lastLoginDate DATETIME NULL,
  resetPasswordToken VARCHAR(64) NULL,
  resetPasswordTokenExpiresAt DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE INDEX email_UNIQUE (email ASC) VISIBLE,
  UNIQUE INDEX resetPasswordToken_UNIQUE (resetPasswordToken ASC) VISIBLE)
`;

export const createMaintenanceTable = 'CREATE TABLE maintenance (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, applicationInitialzied CHAR, legacyAppUser CHAR, legacyAppUpdated CHAR)';

export const addMaintenanceTableEntry = `INSERT INTO maintenance (applicationInitialzied, legacyAppUser, legacyAppUpdated) VALUES (1, 0, 0);`

export const getMaintenanceTableEntry = `SELECT * from maintenance WHERE id = 1;`

export const setLegacyUserTrue = `UPDATE maintenance SET legacyAppUser = 1 WHERE id = 1`;

export const setLegacyUserFalse = `UPDATE maintenance SET legacyAppUser = 1 WHERE id = 1`;

export const getLegacyAppUser = `SELECT legacyAppUser FROM maintenance WHERE id = 1`;

export const sqlSetLegacyAppUpdated = `UPDATE maintenance SET legacyAppUpdated = 1 WHERE id = 1`;

export const getLegacyAppUpdated = `SELECT legacyAppUpdated FROM maintenance WHERE id = 1`;

export const upgradeVideosSubtitlesToLongtext = `ALTER TABLE videos MODIFY COLUMN subtitles LONGTEXT;`;

export const createTagsTable = `
CREATE TABLE IF NOT EXISTS tags (
  id INT NOT NULL AUTO_INCREMENT,
  userId INT NOT NULL,
  name VARCHAR(80) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY tags_user_name (userId, name),
  CONSTRAINT fk_tags_user FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB
`;

export const createVideoTagsTable = `
CREATE TABLE IF NOT EXISTS video_tags (
  videoId INT NOT NULL,
  tagId INT NOT NULL,
  PRIMARY KEY (videoId, tagId),
  KEY vt_tag (tagId),
  CONSTRAINT fk_vt_video FOREIGN KEY (videoId) REFERENCES videos (id) ON DELETE CASCADE,
  CONSTRAINT fk_vt_tag FOREIGN KEY (tagId) REFERENCES tags (id) ON DELETE CASCADE
) ENGINE=InnoDB
`;

export const createMp3TagsTable = `
CREATE TABLE IF NOT EXISTS mp3_tags (
  mp3Id INT NOT NULL,
  tagId INT NOT NULL,
  PRIMARY KEY (mp3Id, tagId),
  KEY mt_tag (tagId),
  CONSTRAINT fk_mt_mp3 FOREIGN KEY (mp3Id) REFERENCES mp3s (id) ON DELETE CASCADE,
  CONSTRAINT fk_mt_tag FOREIGN KEY (tagId) REFERENCES tags (id) ON DELETE CASCADE
) ENGINE=InnoDB
`;

export const createDownloadsTable = `
CREATE TABLE IF NOT EXISTS downloads (
  id INT NOT NULL AUTO_INCREMENT,
  userId INT NOT NULL,
  downloadOption VARCHAR(20) NOT NULL,
  mediaType VARCHAR(10) NOT NULL,
  mediaId INT NULL,
  downloadedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY downloads_user (userId),
  KEY downloads_user_date (userId, downloadedAt),
  CONSTRAINT fk_downloads_user FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB
`;

export const addDownloadOptionToVideos = `ALTER TABLE videos ADD COLUMN downloadOption VARCHAR(20) NULL`;

export const addDownloadOptionToMp3s = `ALTER TABLE mp3s ADD COLUMN downloadOption VARCHAR(20) NULL`;

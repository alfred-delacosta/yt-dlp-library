export const createVideosTable = 'CREATE TABLE videos (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, name VARCHAR(500) NOT NULL, description TEXT, ext VARCHAR(10), downloadDate DATETIME, link VARCHAR(500), type INT, videoPath TEXT, userId INT, CONSTRAINT user_video_id FOREIGN KEY (userId) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION);'

export const createThumbnailsTable = 'CREATE TABLE thumbnails (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, videoId INT, name VARCHAR(500) NOT NULL, thumbnailPath TEXT, CONSTRAINT fk_videoId FOREIGN KEY (videoId) REFERENCES videos(id) ON DELETE CASCADE)';

export const createMP3sTable = "CREATE TABLE mp3s (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, name VARCHAR(500) NOT NULL, description TEXT, downloadDate DATETIME, link VARCHAR(150), mp3Path TEXT, userId INT, CONSTRAINT user_mp3_id FOREIGN KEY (userId) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION)";

export const createUsersTable = `
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(100) NOT NULL,
  password TEXT NOT NULL,
  lastLoginDate DATETIME NULL,
  resetPasswordToken VARCHAR(45) NULL,
  resetPasswordTokenExpiresAt DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE INDEX email_UNIQUE (email ASC) VISIBLE,
  UNIQUE INDEX resetPasswordToken_UNIQUE (resetPasswordToken ASC) VISIBLE)
`;
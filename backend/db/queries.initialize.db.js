export const createVideosTable = 'CREATE TABLE videos (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, name VARCHAR(500) NOT NULL, description TEXT, ext VARCHAR(10), downloadDate DATETIME, link VARCHAR(500), type INT, videoPath TEXT)'

export const createThumbnailsTable = 'CREATE TABLE thumbnails (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, videoId INT, name VARCHAR(500) NOT NULL, thumbnailPath TEXT, CONSTRAINT fk_videoId FOREIGN KEY (videoId) REFERENCES videos(id) ON DELETE CASCADE)';

export const createMP3sTable = "CREATE TABLE mp3s (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, name VARCHAR(500) NOT NULL, description TEXT, downloadDate DATETIME, link VARCHAR(150), mp3Path TEXT)";
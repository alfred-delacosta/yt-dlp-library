export const addUsersToVideosTable = `
ALTER TABLE videos
ADD COLUMN userId INT,
ADD CONSTRAINT fk_videos_userid
FOREIGN KEY (userId) REFERENCES users (userId);
`;

export const addUsersToMp3sTable = `
ALTER TABLE mp3s
ADD COLUMN userId INT,
ADD CONSTRAINT fk_mp3s_userid
FOREIGN KEY (userId) REFERENCES users (userId);
`;

export const addServerPathToVideos = `
ALTER TABLE videos
ADD COLUMN serverPath TEXT;
`;

export const addServerPathToMp3s = `
ALTER TABLE mp3s
ADD COLUMN serverPath TEXT;
`;

export const addServerPathToThumbnails = `
ALTER TABLE thumbnails
ADD COLUMN serverPath TEXT;
`;
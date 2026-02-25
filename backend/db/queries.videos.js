import { Video, Thumbnail } from './models.js';

export const getAllVideosForUser = async (userId) => {
  return await Video.findAll({
    where: { userId },
    include: Thumbnail,
    order: [['id', 'DESC']],
  });
};

export const getVideoCountForUser = async (userId) => {
  return await Video.count({ where: { userId } });
};

export const sqlGetVideo = async (userId, videoId) => {
  return await Video.findAll({
    where: { userId, id: videoId },
    include: Thumbnail,
  });
};

export const sqlAddVideo = async (file, description = "No description", userId) => {
  return await Video.create({
    name: file.basename,
    description,
    ext: file.extension,
    link: file.link,
    type: 0,
    videoPath: file.path,
    userId,
    serverPath: file.serverPath,
  });
};

export const sqlUpdateVideo = async (video) => {
  return await Video.update(video, { where: { id: video.id } });
};

export const sqlUpdateVideoPaths = async (videoPath, serverPath, videoId) => {
  return await Video.update({ videoPath, serverPath }, { where: { id: videoId, userId: 1 } });
};

export const sqlDeleteVideo = async (userId, videoId) => {
  return await Video.destroy({ where: { userId, id: videoId } });
};

export const sqlCheckVideoByLink = async (userId, videoLink) => {
  return await Video.findAll({ where: { userId, link: videoLink } });
};

export const sqlAddSubtitlesToVideo = async (videoId, subtitles) => {
  return await Video.update({ subtitles }, { where: { id: videoId } });
};

export const getVideosForUserPaginated = async (userId, limit, offset) => {
  const { rows } = await Video.findAndCountAll({
    where: { userId },
    include: Thumbnail,
    order: [['id', 'DESC']],
    limit,
    offset,
  });
  return rows;
};
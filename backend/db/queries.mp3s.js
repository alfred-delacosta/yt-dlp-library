import { Mp3, Thumbnail } from './models.js';

export const getAllMp3s = async () => {
  return await Mp3.findAll();
};

export const getAllMp3sForUser = async (userId) => {
  return await Mp3.findAll({
    where: { userId },
    include: Thumbnail,
    order: [['id', 'DESC']],
  });
};

export const getMp3CountForUser = async (userId) => {
  return await Mp3.count({ where: { userId } });
};

export const getMp3 = async (userId, mp3Id) => {
  return await Mp3.findAll({
    where: { userId, id: mp3Id },
    include: Thumbnail,
  });
};

export const sqlUpdateMp3Paths = async (mp3Path, serverPath, mp3Id) => {
  return await Mp3.update({ mp3Path, serverPath }, { where: { id: mp3Id, userId: 1 } });
};

export const sqlDeleteMp3 = async (userId, mp3Id) => {
  return await Mp3.destroy({ where: { userId, id: mp3Id } });
};

export const addMp3ToDb = async (file, description = "", userId) => {
  return await Mp3.create({
    name: file.basename,
    description,
    link: file.link,
    mp3Path: file.path,
    userId,
    serverPath: file.serverPath,
  });
};

export const getMp3sForUserPaginated = async (userId, limit, offset) => {
  const { rows } = await Mp3.findAndCountAll({
    where: { userId },
    include: Thumbnail,
    order: [['id', 'DESC']],
    limit,
    offset,
  });
  return rows;
};
import { Video, Mp3, Thumbnail } from './models.js';
import { Op } from 'sequelize';

export const sqlSearchVideos = async (searchTerm, userId) => {
  return await Video.findAll({
    where: {
      userId,
      [Op.or]: [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } },
        { subtitles: { [Op.like]: `%${searchTerm}%` } },
      ],
    },
    include: Thumbnail,
  });
};

export const sqlSearchMp3s = async (searchTerm, userId) => {
  return await Mp3.findAll({
    where: {
      userId,
      [Op.or]: [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } },
      ],
    },
    include: Thumbnail,
  });
};
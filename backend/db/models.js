import { DataTypes } from 'sequelize';
import sequelize from './sequelize.js';

const Video = sequelize.define('Video', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ext: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  downloadDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  videoPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  serverPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  subtitles: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'videos',
  timestamps: false,
});

const Mp3 = sequelize.define('Mp3', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  downloadDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mp3Path: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  serverPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'mp3s',
  timestamps: false,
});

const Thumbnail = sequelize.define('Thumbnail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  videoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  mp3Id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  thumbnailPath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'thumbnails',
  timestamps: false,
});

// Associations
Video.hasMany(Thumbnail, { foreignKey: 'videoId' });
Thumbnail.belongsTo(Video, { foreignKey: 'videoId' });

Mp3.hasMany(Thumbnail, { foreignKey: 'mp3Id' });
Thumbnail.belongsTo(Mp3, { foreignKey: 'mp3Id' });

export { Video, Mp3, Thumbnail };
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require("../models/user.model");
const Post = require('../models/post.model');

const Comment = sequelize.define('tbl_comment', {
  CommentID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  PostID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Post,
      key: "post_id",
    },
  },
  UserID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  Comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

Comment.sync()
  .then(() => {
  })
  .catch((err) => {
    console.error("Error creating post table:", err);
  });

module.exports = Comment;

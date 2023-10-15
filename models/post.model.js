const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");
const User = require("../models/user.model");

const Post = sequelize.define("tbl_post", {
  post_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
});

Post.sync()
  .then(() => {
    console.log("Post table created successfully");
  })
  .catch((err) => {
    console.error("Error creating post table:", err);
  });

module.exports = Post;

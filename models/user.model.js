const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const User = sequelize.define("tbl_user", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  birthdate: {
    type: DataTypes.DATE,
    allowNull: true
},
  image_url: {
  type: DataTypes.STRING,
  allowNull: true,
},
});

User.sync()
  .then(() => {
  })
  .catch((err) => {
    console.error("Error creating user table:", err);
  });

module.exports = User;

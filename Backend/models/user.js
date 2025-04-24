// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db/config");

const User = sequelize.define(
  "userTable",
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false, // Set to true if you want createdAt/updatedAt
  }
);

module.exports = User;

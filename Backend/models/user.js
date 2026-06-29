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
    avatar_seed: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "byte-bot",
    },
    last_seen: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    // Fix #4: Push notification subscription stored in DB so it survives server restarts
    push_subscription: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: false, // Set to true if you want createdAt/updatedAt
  }
);

module.exports = User;

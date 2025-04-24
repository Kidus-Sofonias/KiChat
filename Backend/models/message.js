const { DataTypes } = require("sequelize");
const sequelize = require("../db/config");

const Message = sequelize.define(
  "Message",
  {
    sender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    receiver: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true, // adds createdAt/updatedAt
  }
);

module.exports = Message;

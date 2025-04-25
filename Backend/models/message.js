const { DataTypes } = require("sequelize");
const sequelize = require("../db/config");

const Message = sequelize.define(
  "Message",
  {
    sender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    receiver: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isFile: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Message;

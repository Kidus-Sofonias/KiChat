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
    fileType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fileUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "",
    },
    // Reply support
    replyTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Messages",
        key: "id",
      },
    },
    replyToContent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    replyToSender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Reactions support - stored as JSON: { emoji: [users] }
    reactions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Message;

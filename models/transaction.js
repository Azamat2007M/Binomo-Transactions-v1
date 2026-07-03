const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Transaction = sequelize.define("Transaction", {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  coin: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  tradePosition: {
    type: DataTypes.ENUM("Buy", "Sell"),
    allowNull: false,
  },
  startPrice: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  endPrice: {
    type: DataTypes.DOUBLE,
    defaultValue: null,
  },
  profit: {
    type: DataTypes.DOUBLE,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM("open", "closed"),
    defaultValue: "open",
  },
  startTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  endTime: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
}, {
  timestamps: true, 
});

module.exports = Transaction;
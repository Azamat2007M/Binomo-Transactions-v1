const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    coin: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    tradePosition: {
      type: String,
      enum: ["Buy", "Sell"],
      required: true,
    },

    startPrice: {
      type: Number,
      required: true,
    },

    endPrice: {
      type: Number,
      default: null,
    },

    profit: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    startTime: {
      type: Date,
      default: Date.now,
    },

    endTime: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
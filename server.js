const express = require('express');
require('dotenv').config();
const { default: mongoose } = require('mongoose');
const cors = require('cors');
const transactionsRouter = require('./routes/transactions');
const axios = require("axios");
const Transaction = require("./models/transaction");
const app = express();
app.use(cors());

app.use(express.json());
app.use('/transactions', transactionsRouter);

const PORT = process.env.PORT || 1000;

mongoose.set('strictQuery', true);

app.listen(PORT, () =>
  console.log('Server:', `http://localhost:${PORT}/transactions`)
);

const autoCloseTrades = async () => {
  try {
    const now = Date.now();

    const openTrades = await Transaction.find({
      status: "open",
      endTime: { $ne: null, $lte: now }
    });

    for (let trade of openTrades) {
      try {
        const priceResponse = await axios.get(
          `https://api.binance.com/api/v3/ticker/price?symbol=${trade.coin.toUpperCase()}`
        );
        const newPrice = Number(priceResponse.data.price);

        let percentChange = 0;
        if (trade.tradePosition === "Buy") {
          percentChange = (newPrice - trade.startPrice) / trade.startPrice;
        } else {
          percentChange = (trade.startPrice - newPrice) / trade.startPrice;
        }
        const profit = trade.amount * percentChange * 100;

        trade.endPrice = newPrice;
        trade.profit = profit;
        trade.status = "closed";

        try {
          const userResponse = await axios.get(
            `https://binomo-backend-v1.onrender.com/users/${trade.userId}`
          );
          const currentWallet = userResponse.data.wallet || 0;
          const newWallet = currentWallet + profit;

          await axios.patch(
            `https://binomo-backend-v1.onrender.com/users/${trade.userId}`,
            { wallet: newWallet }
          );
        } catch (error) {
          console.log("User wallet didn't update for trade:", trade._id);
        }

        await trade.save();
      } catch (error) {
        console.log("Error processing trade:", trade._id, error.message);
      }
    }

    await Transaction.deleteMany({
      status: "closed",
      endTime: { $lt: Date.now() - 30 * 24 * 60 * 60 * 1000 } 
    });

  } catch (error) {
    console.log("Auto close error:", error.message);
  }
};

setInterval(autoCloseTrades, 5000);

const startServer = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URL)
      .then(() => console.log('OK!'))
      .catch(() => console.log('ERROR!'));
  } catch (error) {
    console.log(error);
  }
};

startServer();

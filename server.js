const express = require('express');
require('dotenv').config();
const sequelize = require('./config/db'); 
const { Op } = require('sequelize'); 
const cors = require('cors');
const transactionsRouter = require('./routes/transactions');
const axios = require("axios");
const Transaction = require("./models/transaction");

const app = express();
app.use(cors());
app.use(express.json());
app.use('/transactions', transactionsRouter);

const PORT = process.env.PORT || 1000;

const autoCloseTrades = async () => {
  try {
    const now = new Date();

    const openTrades = await Transaction.findAll({
      where: {
        status: "open",
        endTime: {
          [Op.ne]: null,  
          [Op.lte]: now   
        }
      }
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
          const currentWallet = Number(userResponse.data.wallet) || 0;
          const newWallet = currentWallet + profit;

          const formData = new FormData();
          formData.append('wallet', newWallet);

          const userUpdateResponse = await axios.patch(
            `https://binomo-backend-v1.onrender.com/users/${trade.userId}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          
          console.log("Кошелек успешно обновлен:", userUpdateResponse.data.wallet);
        } catch (error) {
          const serverError = error.response ? error.response.data : error.message;
          console.log("User wallet didn't update for trade ID. Причина:", serverError);
        }

        await trade.save();
      } catch (error) {
        console.log("Error processing trade ID:", trade.id, error.message);
      }
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await Transaction.destroy({
      where: {
        status: "closed",
        endTime: {
          [Op.lt]: thirtyDaysAgo 
        }
      }
    });

  } catch (error) {
    console.log("Auto close error:", error.message);
  }
};

setInterval(autoCloseTrades, 5000);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL for Transactions connected successfully.');
    
    await sequelize.sync({ alter: true });
    console.log('Transaction tables synced.');

    app.listen(PORT, () =>
      console.log('Server:', `http://localhost:${PORT}/transactions`)
    );
  } catch (error) {
    console.log('Database connection error:', error);
  }
};

startServer();
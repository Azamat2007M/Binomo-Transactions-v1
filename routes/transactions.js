const { Router } = require('express');
const router = Router();
const Transaction = require('../models/transaction');

router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.post("/", async (req, res) => {
  try {
    const { userId, coinPrice, coin, amount, tradePosition, duration } = req.body;
    console.log(userId, coinPrice, coin, amount, tradePosition, duration);
    if (!userId || !coinPrice || !amount || !tradePosition) {
      return res.status(400).json(`Missing required fields ${userId}`);
    }

    const startPrice = Number(coinPrice);
    let endTime = null;

    if (duration) {
      const durationMs = Number(duration) * 60000;
      if (isNaN(durationMs)) {
        return res.status(400).json("Invalid duration");
      }
      endTime = new Date(Date.now() + durationMs);
    }

    const transaction = await Transaction.create({
      userId,
      coin,
      amount,
      tradePosition,
      startPrice,
      endTime,
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Transaction.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json("Transaction not found");
    }

    res.send(`${id} Transaction was successfully deleted: OK`);
  } catch (error) {
    console.log({
      error: error.message,
      message: "Transaction wasn't deleted. Something went wrong!",
    });
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) return res.status(404).json("Transaction not found");

    res.status(200).json(transaction);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
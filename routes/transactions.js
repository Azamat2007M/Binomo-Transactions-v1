const { Router } = require('express');
const router = Router();
const Transaction = require('../models/transaction');
const axios = require("axios");

// get
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(400).json(error.message);
  }
});
// get

//post
router.post("/", async (req, res) => {
  try {
    const { userId, coinPrice, coin, amount, tradePosition, duration } = req.body;

    if (!userId || !coinPrice || !amount || !tradePosition) {
      return res.status(400).json("Missing required fields");
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

    const transaction = new Transaction({
      userId,
      coin,
      amount,
      tradePosition,
      startPrice,
      endTime,
    });

    await transaction.save();

    res.status(201).json(transaction);

  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});
//post

//delete
router.delete('/:_id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete({ _id: req.params._id });

    res.send(`${req.params._id} Transaction was successfuly deleted: OK`);
  } catch (error) {
    console.log({
      error,
      message: "Transaction wasn't deleted. Something went wrong!",
    });
  }
});
//delete

//get by id
router.get('/:_id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params._id);
    
    res.status(200).json(transaction);
  } catch (error) {
    res.status(400).json(error.message);
  }
});
//get by id

module.exports = router;

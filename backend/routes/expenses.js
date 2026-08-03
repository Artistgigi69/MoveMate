const express = require("express");

const Expense = require("../models/Expense");
const verifyToken = require("../middleware/auth");

const router = express.Router();


// ================== CREATE EXPENSE ==================
router.post("/", verifyToken, async (req, res) => {
  try {

    const {
      title,
      amount,
      category,
      date,
      description
    } = req.body;


    const expense = await Expense.create({
      userId: req.userId,
      title,
      amount,
      category,
      date,
      description
    });


    res.json(expense);


  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
});



// ================== GET ALL EXPENSES ==================
router.get("/", verifyToken, async (req, res) => {
  try {

    const expenses = await Expense.find({
      userId: req.userId
    }).sort({
      createdAt: -1
    });


    res.json(expenses);


  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
});



// ================== UPDATE EXPENSE ==================
router.put("/:id", verifyToken, async (req, res) => {
  try {

    const expense = await Expense.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId
      },
      req.body,
      {
        new: true
      }
    );


    if (!expense) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }


    res.json(expense);


  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
});



// ================== DELETE EXPENSE ==================
router.delete("/:id", verifyToken, async (req, res) => {
  try {

    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });


    if (!expense) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }


    res.json({
      message: "Expense deleted"
    });


  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
});


module.exports = router;
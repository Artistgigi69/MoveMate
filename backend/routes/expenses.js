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

    if (!title || !category) {
      return res.status(400).json({
        message: "Title and category are required"
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Amount must be a positive number"
      });
    }


    const expense = await Expense.create({
      userId: req.userId,
      title,
      amount: numericAmount,
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

    // Only ever touch these fields from the request body — passing req.body
    // straight through would let a caller slip in userId and reassign the
    // expense to someone else's account.
    const updates = {};

    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.category !== undefined) updates.category = req.body.category;
    if (req.body.date !== undefined) updates.date = req.body.date;
    if (req.body.description !== undefined) updates.description = req.body.description;

    if (req.body.amount !== undefined) {

      const numericAmount = Number(req.body.amount);

      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          message: "Amount must be a positive number"
        });
      }

      updates.amount = numericAmount;
    }

    const expense = await Expense.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId
      },
      updates,
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
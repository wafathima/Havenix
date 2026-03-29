const express = require("express");
const router = express.Router();
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats
} = require("../../controllers/builder/expenseController");
const protect = require("../../middleware/user/authMiddleware");
const expenseUpload = require("../../middleware/expenseUploadMiddleware");

router.use(protect);

router.get("/", getExpenses);
router.get("/stats", getExpenseStats);
router.get("/:id", getExpense);
router.post("/", expenseUpload.single("receipt"), createExpense); 
router.put("/:id", expenseUpload.single("receipt"), updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;
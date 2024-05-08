const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', expenseController.addExpense);
router.get('/', expenseController.getExpenses);
router.get('/grouped', expenseController.groupedExpenses);
router.get('/category/:categoryId/monthly', expenseController.monthlyExpensesByCategory);

module.exports = router;

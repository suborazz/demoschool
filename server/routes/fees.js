const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createFee,
  getAllFees,
  getFeeById,
  updateFee,
  deleteFee,
  recordPayment,
  createRazorpayOrder
} = require('../controllers/feeController');

// Apply protection middleware
router.use(protect);

// Admin routes
router.post('/', authorize('admin'), createFee);
router.get('/', authorize('admin', 'staff'), getAllFees);
router.get('/:id', authorize('admin', 'staff', 'parent'), getFeeById);
router.put('/:id', authorize('admin'), updateFee);
router.delete('/:id', authorize('admin'), deleteFee);

// Payment routes
router.post('/:id/payment', authorize('admin', 'parent'), recordPayment);
router.post('/:id/razorpay-order', authorize('parent'), createRazorpayOrder);

module.exports = router;


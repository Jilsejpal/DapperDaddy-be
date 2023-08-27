const Coupon = require('../models/couponModel');
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");



//1- @desc    Create a new coupon
exports.createCoupon = catchAsyncErrors(async (req, res, next) => {
  const savedCoupon = await Coupon.create(req.body);

  res.status(201).json({
    success: true,
    savedCoupon,
  });
});




//2- @desc    Get all coupons
exports.getAllCoupons = catchAsyncErrors(async (req, res, next) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});




// Apply a coupon to an order
exports.applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;

    // Find the coupon by code
    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Check if the coupon is still valid (not expired)
    const currentDate = new Date();
    if (currentDate > coupon.expiryDate) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    // Calculate the discounted price and return it to the client
    const { totalPrice } = req.body; // Assuming the total price of the order is sent in the request body
    const discountedPrice = totalPrice - coupon.discountAmount;

    return res.status(200).json({ discountedPrice });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};



// Delete a coupon by ID
exports.deleteCoupon = catchAsyncErrors(async (req, res, next) => {
  
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new ErrorHander('Coupon not found', 404));
  }

  await coupon.remove();

  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully',
  });
});

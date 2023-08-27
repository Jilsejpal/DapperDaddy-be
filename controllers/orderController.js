const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const Product = require("../models/productModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");



// Create new Order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentMethod,
        couponCode,
    } = req.body;

    // Check if the couponCode is provided and valid
    let couponDiscount = 0;
    if (couponCode) {
        const { data } = await axios.post("/api/v1/applycoupon", {
            couponCode,
        });
        couponDiscount = data.discount || 0;
    }

    // Calculate the total price with the coupon discount
    const totalWithDiscount = totalPrice - couponDiscount;

    let order;
    if (paymentMethod === "stripe") {
        // Stripe Payment
        order = await Order.create({
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice: totalWithDiscount,
            couponDiscount,
            paidAt: Date.now(),
            user: req.user._id,
            paymentMethod: "stripe",
        });
    } else if (paymentMethod === "cod") {
        // COD Payment
        order = await Order.create({
            shippingInfo,
            orderItems,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice: totalWithDiscount,
            couponDiscount,
            user: req.user._id,
            paymentMethod: "cod",
        });
    } else {
        return next(new ErrorHandler("Invalid payment method", 400));
    }

    res.status(201).json({
        success: true,
        order,
    });
});




// get Single Order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    );

    if (!order) {
        return next(new ErrorHander("Order not found with this Id", 404));
    }

    res.status(200).json({
        success: true,
        order,
    });
});


// get logged in user Orders
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id });

    res.status(200).json({
        success: true,
        orders,
    });
});


// get all Orders -- Admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    });
});



// update Order Status -- Admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHander("Order not found with this Id", 404));
    }

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHander("You have already delivered this order", 400));
    }

    if (req.body.status === "Shipped") {
        order.orderItems.forEach(async (o) => {
            await updateStock(o.product, o.quantity);
        });
    }
    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true,
    });
});

// Function to update product stock
async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    product.Stock -= quantity;

    await product.save({ validateBeforeSave: false });
}



// Cancel Order by User
exports.cancelOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHander("Order not found with this Id", 404));
    }

    if (order.orderStatus === "Cancelled") {
        return next(new ErrorHander("This order is already cancelled", 400));
    }

    // Update the order status to "Cancelled" and set cancelledAt date
    order.orderStatus = "Cancelled";
    order.cancelledAt = Date.now();
    order.isCancelled = true;

    await order.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true,
    });
});

// Delete Order -- Admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHander("Order not found with this Id", 404));
    }

    await order.remove();

    res.status(200).json({
        success: true,
    });
});

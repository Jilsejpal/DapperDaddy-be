const express = require("express");
const { deleteCoupon, getAllCoupons, createCoupon, applyCoupon } = require("../controllers/couponController");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");



const router = express.Router();



router.route("/admin/coupon/new").post(isAuthenticatedUser, authorizeRoles("admin"), createCoupon);

router.route("/coupons").get(isAuthenticatedUser, authorizeRoles("admin"), getAllCoupons);

router.route("/admin/coupon/:id").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteCoupon);

router.route("/applycoupon").post(isAuthenticatedUser, applyCoupon);


module.exports = router;
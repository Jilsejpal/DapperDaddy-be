const express = require("express");


const { createBanner, deleteBanner, getAllBanners, getBannerById, updateBanner } = require("../controllers/bannerController");


const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");


const router = express.Router();




router.route("/admin/banners").get(getAllBanners);

router.route("/admin/banner/new").post(isAuthenticatedUser, authorizeRoles("admin"), createBanner);

router.route("/admin/banner/:id").put(isAuthenticatedUser, authorizeRoles("admin"), updateBanner);

router.route("/admin/banner/:id").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteBanner);

router.route("/banner/:id").get(getBannerById);

module.exports = router;
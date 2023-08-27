const Banner = require("../models/bannerModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");



// Create a new banner
exports.createBanner = catchAsyncErrors(async (req, res, next) => {

    let images = [];

    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "banners",
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }

    req.body.images = imagesLinks;

    req.body.user = req.user.id;

    const banner = await Banner.create(req.body);

    res.status(201).json({
        success: true,
        banner,
    });
});




// Get all banners
exports.getAllBanners = catchAsyncErrors(async (req, res, next) => {
    try {
        const banners = await Banner.find();
        res.json(banners);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
})


// get banner details
exports.getBannerById = catchAsyncErrors(async (req, res, next) => {

    const banner = await Banner.findById(req.params.id);

    if (!banner) {
        return next(new ErrorHander("banner not found", 404))
        // return res.status(500).json({ success: false, message: "Banner not found" })
    }

    res.status(200).json({
        success: true,
        banner,
    })

})


// Update an existing banner
exports.updateBanner = catchAsyncErrors(async (req, res, next) => {

    let banner = await Banner.findById(req.params.id);

    if (!banner) {
        return next(new ErrorHander("banner not found", 404))
        // return res.status(500).json({ success: false, message: "Product not found" })
    }


    // /////////////////Images 

    let images = [];

    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }


    if (images !== undefined) {

        // deleting Images from cloudinary
        for (let i = 0; i < banner.images.length; i++) {
            await cloudinary.v2.uploader.destroy(banner.images[i].public_id);
        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "banners",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        req.body.images = imagesLinks;
    }


    // ////////////////

    banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        banner,
    })
})



// Delete a banner
exports.deleteBanner = catchAsyncErrors(async (req, res, next) => {

    const banner = await Banner.findById(req.params.id);

    if (!banner) {
        return next(new ErrorHander("Banner not found", 404))
        // return res.status(500).json({ success: false, message: "Product not found" })
    }


    // deleting Images from cloudinary
    for (let i = 0; i < banner.images.length; i++) {
        await cloudinary.v2.uploader.destroy(banner.images[i].public_id);
    }

    await banner.remove();

    res.status(200).json({ success: true, message: "Banner Delete Successfully" })

});

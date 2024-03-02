const PortfolioItem = require('../models/portfolioItemModel');
const catchAsync = require('../utils/catchAsync');
const path = require('path');
const AppError = require('../utils/appError');
const fs = require('fs');

exports.addPortfolioItem = catchAsync(async (req, res, next) => {
    const images =  req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const newPortfolioItem = await PortfolioItem.create({
        titleenglish: req.body.titleenglish,
        titlerussian: req.body.titlerussian,
        descriptionenglish: req.body.descriptionenglish,
        descriptionrussian: req.body.descriptionrussian,
        images: images,
        lastModifyed: Date.now()
    });

    res.redirect('/dashboard');
});

exports.getAllPortfolioItems = catchAsync(async (req, res, next) => {
    const portfolioItems = await PortfolioItem.find();

    res.locals.data = { // Store data in res.locals
        portfolioItems
    };
    console.log(res.locals.data);
    next();
});

exports.editPortfolioItem = catchAsync(async (req, res, next) => {
    const postid = req.body.editid;

    const editedPost = {};

    if (req.body.titleenglish) {
        editedPost.titleenglish = req.body.titleenglish;
    }
    if (req.body.titlerussian) {
        editedPost.titlerussian = req.body.titlerussian;
    }
    if (req.body.descriptionenglish) {
        editedPost.descriptionenglish = req.body.descriptionenglish;
    }
    if (req.body.descriptionrussian) {
        editedPost.descriptionrussian = req.body.descriptionrussian;
    }
    if (req.files) {
        editedPost.images = req.files.map(file => `/uploads/${file.filename}`);
    }
    const updatedItem = await PortfolioItem.findByIdAndUpdate(postid, editedPost, {
        new: true, // Return the updated document
        runValidators: true // Run validators on the updated data
    });
    if (!updatedItem) {
        return next(new AppError('No portfolio item found with that ID', 404));
    }
    res.redirect('/dashboard');

});

exports.deletePortfolioItem = catchAsync(async (req, res, next) => {
    const deletedPost = await PortfolioItem.findByIdAndDelete(req.body.id);

    deletedPost.images.forEach(image => {
        const imagePath = path.join(__dirname, '../', image);
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error(`Error deleting image: ${err}`);

            }
        });
    });
    res.redirect('/dashboard');
});
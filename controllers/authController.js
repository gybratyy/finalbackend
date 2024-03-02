
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });




exports.register = catchAsync(async (req, res, next) => {
    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });

    if (existingUser) {
        return res.status(400).json({
            status: 'fail',
            message: 'Username or email already exists. Please choose a different one.'
        });
    }

    // If username and email are unique, proceed with creating the user
    const newUser = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: 'user',
        country: req.body.country,
        city: req.body.city,
        age: req.body.age,
        language: req.body.language
    });


if (newUser) {
    req.session.user = newUser;

}
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.DEV_EMAIL,
            pass: process.env.DEV_EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.DEV_EMAIL,
        to: newUser.email,
        subject: 'Welcome!',
        text: `Hello ${req.session.user.username}, from now you have access to my portfolio!`
    };
    transporter.sendMail(mailOptions);

    res.redirect('/home');

});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password'));
    }
    if (user) {
       /* req.session.user = { id: user._id, username: user.username, language: user.language};
*/
        req.session.user = user;
        console.log(req.session.user);
    }
    res.redirect('/home'); // Or any other target route after login
});
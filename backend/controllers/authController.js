const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');

// Generate JWT
const ActivityLog = require('../models/ActivityLog');
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'employee',
    });

    if (user) {
        await ActivityLog.create({
            action: 'Registered new account',
            performedBy: user._id,
            targetType: 'user',
            targetId: user._id,
            details: `User ${user.email} registered`
        });
        
        res.status(201).json({
            id: user.id,
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        await ActivityLog.create({
            action: 'Logged in',
            performedBy: user._id,
            targetType: 'system',
            details: `User ${user.email} logged in`
        });

        res.json({
            id: user.id,
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json({
        id: req.user.id,
        _id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
    });
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        res.status(404);
        throw new Error('There is no user with that email');
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url (this won't actually be clicked if we just use a token or a UI mock, but let's mock it)
    const resetUrl = `http://localhost:3000/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    const htmlMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #2563eb; text-align: center;">NeuroTask Security</h2>
            <p style="color: #334155; font-size: 16px;">Hello,</p>
            <p style="color: #334155; font-size: 16px;">You are receiving this email because you requested a password reset for your NeuroTask account. Click the secure link below to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Reset Password</a>
            </div>
            <p style="color: #64748b; font-size: 14px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">This link will expire in 10 minutes.</p>
        </div>
    `;

    try {
        await sendEmail(user.email, 'NeuroTask Password Reset', message, htmlMessage);
        await ActivityLog.create({
            action: 'Requested Password Reset',
            performedBy: user._id,
            targetType: 'user',
            targetId: user._id,
            details: `User ${user.email} requested a password reset`
        });
        res.status(200).json({ success: true, token: resetToken, data: 'Email sent' });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500);
        throw new Error('Email could not be sent');
    }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid token or token expired');
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    await ActivityLog.create({
        action: 'Reset Password',
        performedBy: user._id,
        targetType: 'user',
        targetId: user._id,
        details: `User ${user.email} reset their password`
    });

    res.status(200).json({
        success: true,
        token: generateToken(user._id)
    });
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    resetPassword
};

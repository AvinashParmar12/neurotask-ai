const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin, Manager)
const getUsers = asyncHandler(async (req, res) => {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password');
    res.json(users);
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Create user by Admin
// @route   POST /api/users
// @access  Private (Admin)
const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({ name, email, password, role });
    
    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Self or Admin)
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    
    if (user) {
        // Only admin or the user themselves can update
        if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this user');
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.avatar = req.body.avatar || user.avatar;
        user.phone = req.body.phone || user.phone;
        
        // Only admin can change roles
        if (req.user.role === 'admin' && req.body.role) {
            user.role = req.body.role;
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            phone: updatedUser.phone
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    
    if (user) {
        await User.deleteOne({ _id: user._id });
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};

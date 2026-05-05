const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected.');

        const users = [
            { name: 'Admin User', email: 'admin@neurotask.com', password: 'password', role: 'admin' },
            { name: 'Manager User', email: 'manager@neurotask.com', password: 'password', role: 'manager' },
            { name: 'Employee User', email: 'employee@neurotask.com', password: 'password', role: 'employee' },
        ];

        for (const u of users) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                await User.create(u);
                console.log(`Created ${u.email}`);
            } else {
                console.log(`${u.email} already exists.`);
            }
        }

        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedUsers();

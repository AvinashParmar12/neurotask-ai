const mongoose = require('mongoose');

// Global plugin to ensure 'id' is always returned in JSON alongside '_id'
mongoose.plugin((schema) => {
    schema.set('toJSON', {
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.__v;
            return ret;
        }
    });
});

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;

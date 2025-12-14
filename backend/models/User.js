// models/User.js

const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // 確保電子郵件不重複
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    // 您可以增加其他欄位，例如:
    // name: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);
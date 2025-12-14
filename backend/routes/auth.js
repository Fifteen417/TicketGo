// routes/auth.js

const express = require('express');
const bcrypt = require('bcryptjs'); // 用於密碼雜湊
const User = require('../models/User');
const router = express.Router();

// --- 1. 註冊 API (/api/auth/register) ---
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 檢查使用者是否已存在
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 建立新使用者
        user = new User({ email, password });

        // 密碼雜湊 (Salt Rounds: 10)
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // 儲存到資料庫
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// --- 2. 登入 API (/api/auth/login) ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 檢查使用者是否存在
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // 檢查密碼是否匹配
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
        
        // 登入成功：您可以發送一個 JWT Token (進階應用)
        // 這裡為了簡化，先只回傳成功訊息
        res.json({ 
            message: 'Login successful',
            user: { email: user.email } // 回傳使用者資訊
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
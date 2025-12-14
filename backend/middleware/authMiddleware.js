// backend/middleware/authMiddleware.js

const User = require('../models/User'); 
// ❗ 確保 models/User.js 存在並已創建

/**
 * 身份驗證保護中間件
 * 檢查請求標頭中是否有用戶 Email，並從資料庫載入用戶資訊
 * @param {object} req - Express 請求物件
 * @param {object} res - Express 回應物件
 * @param {function} next - 繼續執行下一個中間件或路由處理器
 */
const protect = async (req, res, next) => {
    // 1. 從請求標頭中獲取 Email (這是我們前端暫時使用的驗證方式)
    const userEmail = req.header('x-user-email');

    if (!userEmail) {
        // 如果沒有 Email，表示未登入
        return res.status(401).json({ message: 'Not authorized, no user email provided' });
    }

    try {
        // 2. 透過 Email 查找使用者
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        // 3. 將使用者資訊附加到請求物件上 (重要：這樣 cart.js 和 orders.js 就能用 req.user 取得 ID)
        req.user = user; 
        
        // 4. 繼續執行下一個處理器 (即 cart.js 或 orders.js 中的邏輯)
        next();

    } catch (error) {
        console.error('Authentication Error:', error.message);
        res.status(500).json({ message: 'Server error during authentication process' });
    }
};

module.exports = protect; // ❗ 確保這裡導出的是這個 'protect' 函式
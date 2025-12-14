// backend/routes/orders.js

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Event = require('../models/Event');
const protect = require('../middleware/authMiddleware');

// --- POST /api/orders/checkout ---
// 處理結帳：將購物車內容轉換為訂單
router.post('/checkout', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. 找到購物車
        const cart = await Cart.findOne({ userId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty. Nothing to checkout.' });
        }

        // 2. 計算總金額
        let totalAmount = cart.items.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0);
        
        // 🚨 [進階功能] 處理優惠碼/折扣邏輯 (您可以在這裡加入 `totalAmount -= cart.discount;` )

        // 3. 創建新訂單 (從購物車複製所有項目)
        const newOrder = new Order({
            userId: userId,
            items: cart.items, // 複製項目
            totalAmount: totalAmount,
            promoCodeUsed: cart.promoCode,
            discount: cart.discount,
            status: 'Paid' // 假設支付成功
        });

        await newOrder.save();

        // 4. 清空購物車 (這是結帳成功的關鍵步驟)
        cart.items = [];
        cart.promoCode = null;
        cart.discount = 0;
        await cart.save();

        // 5. 回傳新訂單資訊
        res.status(201).json({ 
            message: 'Checkout successful! Order placed.',
            orderId: newOrder._id,
            totalAmount: newOrder.totalAmount,
            itemsCount: newOrder.items.length
        });

    } catch (err) {
        console.error('Checkout Error:', err.message);
        res.status(500).send('Server Error during checkout process');
    }
});


// --- GET /api/orders ---
// 獲取當前使用者的所有歷史訂單
router.get('/', protect, async (req, res) => {
    try {
        // 查詢所有與 userId 相關聯的訂單，並按照日期降序排序
        const orders = await Order.find({ userId: req.user._id })
            .sort({ orderDate: -1 }); 

        res.json(orders);
    } catch (err) {
        console.error('Fetch Orders Error:', err.message);
        res.status(500).send('Server Error fetching orders');
    }
});


module.exports = router;
// backend/routes/cart.js

const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart'); // 購物車模型
const Event = require('../models/Event'); // 活動模型
const protect = require('../middleware/authMiddleware'); // 身份驗證中間件

// 🚨 注意：您需要在 models/Cart.js 中定義 Cart 模型，並在 middleware/authMiddleware.js 中定義 protect 函式

// --- 1. GET /api/cart ---
// 獲取當前使用者的購物車內容
router.get('/', protect, async (req, res) => {
    try {
        // req.user._id 由 protect 中間件設定
        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            // 如果購物車不存在，回傳空清單，而不是 404
            return res.json({ items: [], totalCount: 0 });
        }

        res.json(cart);

    } catch (err) {
        console.error('Fetch Cart Error:', err.message);
        res.status(500).send('Server Error fetching cart');
    }
});


// --- 2. POST /api/cart/add ---
// 將一個商品添加到購物車
router.post('/add', protect, async (req, res) => {
    const { eventId, quantity } = req.body;
    const userId = req.user._id;

    if (!eventId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid event ID or quantity.' });
    }

    try {
        // 1. 檢查活動是否存在並獲取價格
        const event = await Event.findOne({ eventId });
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }
        
        // 獲取活動的基本資訊和價格
        const itemDetails = {
            eventId: event.eventId,
            title: event.title,
            basePrice: event.basePrice,
            imageUrl: event.imageUrl,
            quantity: Number(quantity)
        };

        // 2. 查找或創建購物車
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // 購物車不存在，創建一個新的
            cart = new Cart({
                userId,
                items: [itemDetails],
            });
        } else {
            // 購物車已存在，檢查商品是否已在清單中
            const existingItemIndex = cart.items.findIndex(
                item => item.eventId.toString() === eventId
            );

            if (existingItemIndex > -1) {
                // 商品已存在，增加數量
                cart.items[existingItemIndex].quantity += Number(quantity);
            } else {
                // 商品不存在，添加到清單
                cart.items.push(itemDetails);
            }
        }

        await cart.save();
        res.status(200).json({ message: 'Item added to cart successfully!', cart });

    } catch (err) {
        console.error('Add To Cart Error:', err.message);
        res.status(500).send('Server Error adding item to cart');
    }
});


// --- 3. DELETE /api/cart/remove ---
// 從購物車中移除一個商品 (或減少數量)
router.delete('/remove', protect, async (req, res) => {
    const { eventId, removeAll } = req.body; // removeAll: true 表示移除所有數量

    try {
        let cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        const existingItemIndex = cart.items.findIndex(
            item => item.eventId.toString() === eventId
        );

        if (existingItemIndex === -1) {
            return res.status(404).json({ message: 'Item not in cart.' });
        }

        if (removeAll || cart.items[existingItemIndex].quantity <= 1) {
            // 移除整個項目
            cart.items.splice(existingItemIndex, 1);
        } else {
            // 減少數量
            cart.items[existingItemIndex].quantity -= 1;
        }

        await cart.save();
        res.status(200).json({ message: 'Item removed from cart successfully!', cart });

    } catch (err) {
        console.error('Remove Cart Item Error:', err.message);
        res.status(500).send('Server Error removing item from cart');
    }
});


// --- 4. POST /api/cart/apply-promo ---
// 處理優惠碼 (簡化版本)
router.post('/apply-promo', protect, async (req, res) => {
    const { promoCode } = req.body;
    
    // 💡 僅接受一個固定的優惠碼作為範例
    const VALID_CODE = 'FINAL'; 
    const DISCOUNT_RATE = 0.1; // 10% 折扣

    try {
        let cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }
        
        if (promoCode.toUpperCase() === VALID_CODE) {
            // 計算總金額
            const subtotal = cart.items.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0);
            const discountAmount = subtotal * DISCOUNT_RATE;

            // 更新購物車的優惠碼和折扣金額
            cart.promoCode = VALID_CODE;
            cart.discount = discountAmount;

            await cart.save();
            res.json({ 
                message: 'Coupon applied successfully!', 
                discount: discountAmount,
                newTotal: subtotal - discountAmount
            });
            
        } else {
            // 清除任何舊的折扣
            cart.promoCode = null;
            cart.discount = 0;
            await cart.save();
            res.status(400).json({ message: 'Invalid or expired coupon code.' });
        }

    } catch (err) {
        console.error('Apply Promo Error:', err.message);
        res.status(500).send('Server Error applying promo');
    }
});


module.exports = router;
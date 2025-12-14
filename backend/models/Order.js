// backend/models/Order.js

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    eventId: { type: String, required: true },
    title: { type: String, required: true },
    basePrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    // 購買時的快照
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema], // 購買的商品清單
    totalAmount: {
        type: Number,
        required: true
    },
    // 訂單狀態：Pending, Paid, Completed, Canceled
    status: {
        type: String,
        default: 'Paid', 
        enum: ['Pending', 'Paid', 'Completed', 'Canceled']
    },
    // 優惠碼 (如果使用)
    promoCodeUsed: {
        type: String,
        default: null
    },
    discount: {
        type: Number,
        default: 0
    },
    // 交易時間
    orderDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // 方便追蹤訂單創建和更新時間
});

module.exports = mongoose.model('Order', orderSchema);
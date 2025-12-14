// backend/models/Event.js

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    // 讓前端可以直接使用 eventId 進行後續操作
    eventId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    // 格式範例: 2025-12-31T20:00:00Z
    date: {
        type: Date,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    // 基礎價格，用於顯示和計算
    basePrice: {
        type: Number,
        required: true,
        min: 0
    },
    // 圖片 URL，Render/Netlify 部署後會使用公開網址
    imageUrl: {
        type: String,
        required: true
    },
    // 簡短的分類標籤 (例如: 'Concert', 'Sports')
    category: {
        type: String,
        required: true,
        enum: ['Concert', 'Sports', 'Drama', 'Exhibition', 'Others'] // 限制可選值
    },
    // 剩餘票數或庫存 (用於模擬購買邏輯)
    stock: {
        type: Number,
        default: 100 
    }
}, {
    timestamps: true // 自動新增 createdAt 和 updatedAt
});

module.exports = mongoose.model('Event', eventSchema);
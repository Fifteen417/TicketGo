// backend/routes/events.js

const express = require('express');
const Event = require('../models/Event');
const router = express.Router();

// --- GET /api/events ---
// 獲取所有活動列表，可選加入篩選和搜尋功能
router.get('/', async (req, res) => {
    try {
        // 1. 獲取所有活動 (未來可以加入篩選條件 req.query)
        const events = await Event.find().sort('date'); 

        // 2. 回傳 JSON 格式資料給前端
        res.json(events);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error while fetching events');
    }
});

// --- GET /api/events/:id ---
// 獲取單一活動的詳細資訊
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findOne({ eventId: req.params.id });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error while fetching single event');
    }
});


// 💡 部署前，您需要一個方法來**初始化/新增**活動資料
// POST /api/events/seed (僅用於開發階段)
router.post('/seed', async (req, res) => {
    try {
        // 為了方便測試，手動新增幾個活動資料
        await Event.deleteMany({}); // 清空舊資料
        const newEvents = [
            { eventId: 'E1001', title: '周傑倫 嘉年華世界巡迴演唱會', date: new Date('2026-03-15T19:30:00Z'), venue: '台北大巨蛋', basePrice: 3800, imageUrl: '/image/jay-chou.jpg', category: 'Concert' },
            { eventId: 'E1002', title: 'NBA 台北夏季邀請賽', date: new Date('2025-07-20T14:00:00Z'), venue: '台北小巨蛋', basePrice: 2500, imageUrl: '/image/nba-game.jpg', category: 'Sports' },
            { eventId: 'E1003', title: 'AI 時代下的藝術展', date: new Date('2025-10-01T10:00:00Z'), venue: '華山文創園區', basePrice: 800, imageUrl: '/image/ai-art.jpg', category: 'Exhibition' },
        ];
        
        await Event.insertMany(newEvents);
        res.json({ message: 'Sample events seeded successfully', count: newEvents.length });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Seeding Error');
    }
});

module.exports = router;
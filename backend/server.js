// backend/server.js

// 1. 引入核心套件
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // 用於處理跨來源請求 (前端在 Netlify, 後端在 Render)
const path = require('path'); // 用於處理檔案路徑

// 載入 .env 檔案中的環境變數
dotenv.config();

// 2. 初始化 Express App
const app = express();

// 3. 設定中間件 (Middleware)
// 允許 Express 伺服器解析 JSON 格式的請求主體 (req.body)
app.use(express.json()); 

// 設定 CORS (跨來源資源共享)
// 在開發階段，允許所有來源的請求，以免被瀏覽器阻止。
app.use(cors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));


// 4. 資料庫連線
const mongoUri = process.env.MONGO_URI; 

// 檢查 MONGO_URI 是否載入成功
if (!mongoUri) {
    console.error('FATAL ERROR: MONGO_URI is not defined in the .env file.');
    process.exit(1); // 立即退出程式，因為沒有資料庫連線將無法運行
}

mongoose.connect(mongoUri)
    .then(() => console.log('✅ MongoDB 連線成功!'))
    .catch(err => {
        console.error('❌ MongoDB 連線失敗，請檢查 MONGO_URI 和網路設定:', err.message);
        process.exit(1); // 連線失敗，立即退出
    });


// 5. 引入並註冊路由
const authRoutes = require('./routes/auth');   // 登入/註冊
const eventsRoutes = require('./routes/events'); // 活動列表
const cartRoutes = require('./routes/cart');   // 購物車
const orderRoutes = require('./routes/orders'); // **[新增] 訂單路由**

app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes); // **[新增] 註冊訂單路由**


// 6. 靜態檔案託管 (用於部署到 Render)
// 這段程式碼的目的是讓 Render 服務也能託管您的前端檔案，
// 但在您將前端部署到 Netlify 後，這段程式碼主要作為 fallback 或測試用。
// 如果您的前端檔案在 /frontend 資料夾，則需要這樣設定。
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// 根路由，導向主要的 HTML 頁面
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'Main_Page.html'));
});

// 7. 啟動伺服器
// Render 部署時會自動提供 process.env.PORT
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
    console.log(`🚀 Server 正在運行，網址: http://localhost:${PORT}`);
    console.log(`🌐 網頁入口: http://localhost:${PORT}/Main_Page.html`);
});
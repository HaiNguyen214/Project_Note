const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
const profilePath = path.json(__dirname, 'data', 'profile.json');
//API : Đọc thông tin profile
app.get('/api/profile', (req, res) => {
    try {
        const rawData = fs.readFileSync(profilePath, 'uft8');
        const profile = JSON.parse(rawData);
        res.json(profile)
    } catch (error) {
        res.status(500).json({ message: "Lỗi đọc file" });
    }
});
// API 2: Cập nhật Profile
app.put('/api/profile', (req, res) => {
    try {
        const newProfile = req.body;
        // Ghi đè dữ liệu mới vào file
        fs.writeFileSync(profilePath, JSON.stringify(newProfile, null, 2), 'utf8');
        res.json({ success: true, message: "Đã cập nhật Profile" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi ghi file" });
    }
});
const PORT = 5000;
app.listen(PORT, () => console.log(`Backend chạy tại http://localhost:${PORT}`));

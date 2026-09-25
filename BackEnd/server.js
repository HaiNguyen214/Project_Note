const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(cors()); // Cho phép FE gọi API
app.use(express.json()); // Đọc dữ liệu JSON từ FE gửi lên
const profilePath = path.join(__dirname, 'data', 'profile.json');
// API 1: Đọc thông tin Profile
app.get('/api/profile', (req, res) => {
    try {
        const rawData = fs.readFileSync(profilePath, 'utf8');
        const profile = JSON.parse(rawData);
        res.json(profile);
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

const notesDir = path.join(__dirname, 'data', 'notes');
// Khởi tạo thư mục tự động nếu chưa tồn tại
if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir, { recursive: true });
}
const getFilePath = (topic) => path.join(notesDir, `${topic}.json`);
// 1. Lấy danh sách ghi chú (GET)
app.get('/api/notes/:topic', (req, res) => {
    const filePath = getFilePath(req.params.topic);
    try {
        if (!fs.existsSync(filePath)) return res.json([]);
        const data = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ message: "Lỗi đọc danh sách ghi chú" });
    }
});
// 2. Thêm mới ghi chú (POST)
app.post('/api/notes/:topic', (req, res) => {
    const filePath = getFilePath(req.params.topic);
    try {
        let notes = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
        const newNote = {
            id: Date.now().toString(),
            title: req.body.title || "Không tiêu đề",
            content: req.body.content || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        notes.push(newNote);
        fs.writeFileSync(filePath, JSON.stringify(notes, null, 2), 'utf8');
        res.json({ success: true, note: newNote });
    } catch (error) {
        res.status(500).json({ message: "Lỗi thêm ghi chú" });
    }
});
// 3. Sửa ghi chú (PUT)
app.put('/api/notes/:topic/:id', (req, res) => {
    const filePath = getFilePath(req.params.topic);
    try {
        let notes = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const index = notes.findIndex(n => n.id === req.params.id);
        if (index !== -1) {
            notes[index].title = req.body.title;
            notes[index].content = req.body.content;
            notes[index].updatedAt = new Date().toISOString();
            fs.writeFileSync(filePath, JSON.stringify(notes, null, 2), 'utf8');
            return res.json({ success: true, message: "Đã sửa thành công" });
        }
        res.status(404).json({ message: "Không tìm thấy ghi chú" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật ghi chú" });
    }
});
// 4. Xóa ghi chú (DELETE)
app.delete('/api/notes/:topic/:id', (req, res) => {
    const filePath = getFilePath(req.params.topic);
    try {
        let notes = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const newNotes = notes.filter(n => n.id !== req.params.id);
        fs.writeFileSync(filePath, JSON.stringify(newNotes, null, 2), 'utf8');
        res.json({ success: true, message: "Đã xóa thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa ghi chú" });
    }
});


const privateNotesFile = path.join(__dirname, 'data', 'private.json');
// Khởi tạo file private.json nếu chưa tồn tại
if (!fs.existsSync(privateNotesFile)) {
    fs.writeFileSync(privateNotesFile, '[]', 'utf8');
}
// 1. API Xác thực mật khẩu
app.post('/api/private/auth', (req, res) => {
    try {
        const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
        // Kiểm tra pass truyền lên có khớp với pass trong profile không
        if (profile.password === req.body.password) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: "Sai mật khẩu!" });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống xác thực" });
    }
});
// 2. API Lấy danh sách Ghi chú riêng tư
app.get('/api/private/notes', (req, res) => {
    try {
        const data = fs.readFileSync(privateNotesFile, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ message: "Lỗi đọc ghi chú riêng tư" });
    }
});
// 3. API Thêm Ghi chú riêng tư
app.post('/api/private/notes', (req, res) => {
    try {
        let notes = JSON.parse(fs.readFileSync(privateNotesFile, 'utf8'));
        const newNote = {
            id: Date.now().toString(),
            title: req.body.title || "Lưu bút mật",
            content: req.body.content || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        notes.push(newNote);
        fs.writeFileSync(privateNotesFile, JSON.stringify(notes, null, 2), 'utf8');
        res.json({ success: true, note: newNote });
    } catch (error) {
        res.status(500).json({ message: "Lỗi thêm ghi chú kín" });
    }
});

//Tim Kiem
app.get('/api/notes/:topic/search', (req, res) => {
    const filePath = getFilePath(req.params.topic);
    const keyword = (req.query.keyword || '').toLowerCase();

    try {
        if (!fs.existsSync(filePath)) {
            return res.json([]);
        }

        const notes = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        const results = notes.filter(note =>
            note.title.toLowerCase().includes(keyword) ||
            note.content.toLowerCase().includes(keyword)
        );

        res.json(results);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi tìm kiếm'
        });
    }
});



app.listen(PORT, () => console.log(`Backend chạy tại http://localhost:${PORT}`));
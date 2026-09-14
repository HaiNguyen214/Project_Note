
const express = require("express");

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("Server đang chạy!");
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});


const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5002;

app.use(cors());

app.get("/mock-api/:delay", (req, res) => {
    const delay = Math.max(0, parseInt(req.params.delay, 10) || 0);

    const reply = () => {
        const data = Array.from({ length: 10 }, (_, i) => ({
            id: i,
            value: Math.random(),
        }));
        res.json({ status: "success", delay, data });
    };

    if (delay > 0) {
        setTimeout(reply, delay);
    } else {
        reply();
    }
});

app.listen(PORT, () => {
    console.log(`Server JS corriendo en http://localhost:${PORT}`);
});

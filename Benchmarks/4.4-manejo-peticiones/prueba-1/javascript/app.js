const express = require("express");
const cors = require("cors");
const app = express();
const port = 5002;

app.use(cors());

function sleepBlocking(ms) {
    const start = Date.now();
    while (Date.now() - start < ms) { }
}

app.get("/mock-api/:delay", (req, res) => {
    const delay = parseInt(req.params.delay, 10);

    if (delay > 0) {
        sleepBlocking(delay);
    }

    const data = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        value: Math.random(),
    }));

    res.json({
        status: "success",
        delay: delay,
        data: data,
    });
});

app.listen(port, () => {
    console.log(`JavaScript Server is running on http://localhost:${port}`);
});

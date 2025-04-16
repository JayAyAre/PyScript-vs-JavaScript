const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5002; // Asegúrate que este puerto coincida con el configurado en el Python

app.use(cors());

app.get("/mock-api/:delay", (req, res) => {
    const delay = parseInt(req.params.delay, 10);
    setTimeout(() => {
        const data = Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            value: i * 10,
        }));
        res.json({
            status: "success",
            delay,
            data,
        });
    }, delay);
});

app.listen(PORT, () => {
    console.log(`JavaScript API corriendo en http://localhost:${PORT}`);
});

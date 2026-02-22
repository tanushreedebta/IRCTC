// server.js
console.log("🔥 SERVER RUNNING 🔥");

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use("/frontend", express.static(path.join(__dirname, "frontend")));

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root@123",
    database: "irctc_resale"
});

db.connect((err) => {
    if (err) console.log("DB connection failed:", err);
    else console.log("MySQL Connected ✅");
});

// Home route
app.get("/", (req, res) => {
    res.send("IRCTC Resale Server 🔥");
});

// ================= REGISTER =================
app.post("/register", async (req, res) => {
    const { name, email, phone, password } = req.body;

    const checkSql = "SELECT * FROM users WHERE email = ?";
    db.query(checkSql, [email], async (err, result) => {
        if (err) return res.status(500).json("Registration Failed");

        if (result.length > 0) return res.status(400).json("User already exists");

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertSql = "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)";

        db.query(insertSql, [name, email, phone, hashedPassword], (err) => {
            if (err) return res.status(500).json("Registration Failed");
            res.json("User Registered Successfully ✅");
        });
    });
});

// ================= LOGIN =================
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, result) => {
        if (err) return res.status(500).json("Login Failed");
        if (result.length === 0) return res.status(400).json("User not found");

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json("Invalid password");

        res.json("Login Successful ✅");
    });
});

// ================= GET TICKETS =================
app.get("/api/tickets", (req, res) => {
    const sql = "SELECT * FROM tickets";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch tickets" });

        const tickets = results.map(ticket => ({
            id: ticket.id,
            train_name: ticket.train_name,
            train_number: ticket.train_number,
            from_station: ticket.from_station,
            to_station: ticket.to_station,
            journey_date: ticket.journey_date,
            passenger_name: ticket.passenger_name,
            price: ticket.price,
            status: ticket.status
        }));

        res.json(tickets);
    });
});

// ================= BUY TICKET =================
app.post("/api/buyticket", (req, res) => {
    const { ticketId } = req.body;
    const sql = "UPDATE tickets SET status = 'Sold' WHERE id = ? AND status = 'Available'";

    db.query(sql, [ticketId], (err, result) => {
        if (err) return res.status(500).json({ error: "Failed to buy ticket" });
        if (result.affectedRows === 0) return res.status(400).json({ error: "Ticket already sold" });

        res.json({ message: "Ticket purchased successfully!" });
    });
});

// ================= START SERVER =================
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} 🚀`));
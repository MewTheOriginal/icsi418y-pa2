const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);

const app = express();

app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
    const { first, last, username, password } = req.body;

    if (!username) {
        return res.status(400).json({
            message: "Username is required"
        });
    }
    if (!password) {
        return res.status(400).json({
            message: "Password is required"
        });
    }
    if (!first) {
        return res.status(400).json({
            message: "First name is required"
        });
    }
    if (!last) {
        return res.status(400).json({
            message: "Last name is required"
        });
    }

    try{
        const db = client.db("pa2");
        const users = db.collection("users");

        const checkUsername = await users.findOne({username:username});

        if(checkUsername) {
            return res.status(409).json({
                message: "Username already exists"
            })
        }

        await users.insertOne({
            f_name: first,
            l_name: last,
            username: username,
            password: password
        });

        return res.status(201).json({
            message: "User created successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        })
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username) {
        return res.status(400).json({
            message: "Please enter username"
        });
    }
    if (!password) {
        return res.status(400).json({
            message: "Please enter password"
        });
    }

    try {
        const db = client.db("pa2");
        const users = db.collection("users");

        const user = await users.findOne({ username: username });

        if (!user) {
            return res.status(401).json({
                message: "Username does not exist"
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                message: "Incorrect password"
            });
        }

        return res.status(200).json({
            message: "Login successful. Logged in as " + user.l_name + ", " + user.f_name
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/", (req, res) => {
    res.json({
        message: "Server is running"
    });
});

app.listen(9000, () => {
    console.log("Server running on port 9000");
    console.log("<http://localhost:9000>");
});

async function connectDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Could not connect to MongoDB");
        console.error(error);
    }
}

connectDatabase();
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const mongoose = require("mongoose");
const client = require("./mongodb");
const bodyParser = require("body-parser");

mongoose.set("strictQuery", false);

const dbURI = process.env.DB_URI;
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());

const auth = require("./routes/auth");
const userCRUD = require("./routes/userCRUD");
const hackathonsCRUD = require("./routes/hackathonsCRUD");
const chatCRUD = require("./routes/chatCRUD");

app.use("/auth", auth);
app.use("/userCRUD", userCRUD);
app.use("/hackathonsCRUD", hackathonsCRUD);
app.use("/chatCRUD", chatCRUD);

// Websocket start
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

app.get("/", (req, res) => {
    res.send("WebSocket Server For Chatter");
});

io.on("connection", (socket) => {
    console.log("a user connected:", socket.id);
    
  socket.on("joinRoom", (data) => {
      socket.join(data.roomCode);
      console.log("joined room", data.roomCode);
    });
    
    socket.on("sendMessage", (data) => {
        socket.to(data.roomCode).emit("recieveMessage", data);
    });
});

server.listen(3000, () => {
    console.log("Socket Server Listening PORT 3000");
});
// Websocket end



const start = async () => {
    try {
        await mongoose.connect(dbURI);
        app.listen(5000, () => {
            console.log(`Listening on port ${PORT}`);
        });
    } catch (err) {
        console.log(err);
        // Removed `res` usage here as it's not valid outside a route handler
    }
};

app.use("/", (req, res) => {
    res.send("Hello World");
});

start();
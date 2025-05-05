const express = require('express');
const mongoose = require('mongoose');
const app = express();
const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const port = 4000;
const cors = require('cors');
const dotenv = require('dotenv');
const messageModel = require('./models/adminmessages');
const startupModel = require("./models/startupmodel");
const Messages = require('./models/adminmessages');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redisClient = require('./config/redis');

dotenv.config();

app.use(express.json());

// Configure CORS
const corsOptions = {
  origin: ['https://wbd-deply.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Connect to MongoDB
mongoose.connect("mongodb+srv://koushik:koushik@cluster0.h2lzgvs.mongodb.net/saiwbd").then(()=>{
  console.log("MongoDB Connected ")
});
// Configure Redis session store
const redisStore = new RedisStore({
    client: redisClient.client,
    prefix: "session:",
    ttl: 86400 // 24 hours
});

app.get('/', (req, res) => {
    res.send("hii")
})

// Session configuration with Redis
app.use(session({
    store: redisStore,
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 86400000 // 24 hours
    }
}));

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: ['https://wbd-deply.vercel.app', 'http://localhost:3000'],
        methods: ["GET", "POST"],
        credentials: true
    },
});

// Middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.get('/', (req, res) => {res.send("hii")})
// 404 Not Found Handler

// Global Error Handler
app.use(( req, res, err , next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong on the server.',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    });
});

// Router-Level Middleware
const routeLogger = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
};


// Routes with Middleware
app.use("/auth", require("./routers/user/auth"));
app.use("/admin",  require("./routers/admin/auth"));

app.use("/user", routeLogger, require("./routers/user/home"));
app.use("/submit", routeLogger, require("./routers/user/forms"));
app.use("/get", routeLogger, require("./routers/admin/Data"));
app.use('/ads', require('./routers/advertisement/advertisement'));
app.use('/review', routeLogger, require('./routers/reviewer/route'));

// Simple route for testing
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Socket.IO connection (unchanged)
io.on('connection', (socket) => {
    // User joins a room based on their startupid from cookies
    socket.on('joinRoom', (startupid) => {
        socket.join(startupid);
        console.log(`User ${socket.id} joined room ${startupid}`);
    });

    // Listen for messages from users in the room
    socket.on('sendMessage', async ({ roomId, messageData }) => {
        console.log("Message received from user in room:", roomId, messageData);
        try {
            io.to(roomId).emit('receiveMessage', messageData);
            console.log(`Message sent to room ${roomId}:`, messageData);
        } catch (error) {
            console.error('Error sending message:', error);
        }
        
        try {
            // Find or create the message document for the specific startup
            const existingMessages = await messageModel.findOne({ startup_id: roomId });
            if (existingMessages) {
                // If messages already exist, push the new message to the messages array
                existingMessages.messsages[existingMessages.messsages.length] = {
                    message: messageData.message,
                    sender: messageData.sender,
                    created_at: new Date(),
                };
                await existingMessages.save();
            } else {
                // If no messages exist, create a new document
                const newMessage = new messageModel({
                    startup_id: roomId,
                    messages: [{
                        message: messageData.message,
                        sender: messageData.sender,
                        created_at: new Date(),
                    }],
                });
                await newMessage.save();
            }
            console.log("Message saved to database.");
        } catch (error) {
            console.error("Error saving message to database:", error);
        }
    });
    
    socket.on('BroadcastMessage', async ({ messageData }) => {
        console.log("Broadcasting message:", messageData);
        try {
            io.emit('receiveMessage', messageData);
            console.log("Broadcast message sent to all clients:", messageData);
        } catch (error) {
            console.error('Error broadcasting message:', error);
        }
    
        try {
            const allStartups = await startupModel.find();
            if (allStartups && allStartups.length > 0) {
                for (let startup of allStartups) {
                    const roomId = startup._id;
                    const existingMessages = await messageModel.findOne({ startup_id: roomId });
                    if (existingMessages) {
                        existingMessages.messsages.push({
                            message: messageData.message,
                            sender: messageData.sender,
                            created_at: new Date(),
                        });
                        await existingMessages.save();
                    } else {
                        const newMessage = new messageModel({
                            startup_id: roomId,
                            messages: [{
                                message: messageData.message,
                                sender: messageData.sender,
                                created_at: new Date(),
                            }],
                        });
                        await newMessage.save();
                    }
                    console.log(`Message saved to database for startup ${roomId}.`);
                }
            } else {
                console.log("No startups found.");
            }
        } catch (error) {
            console.error("Error saving broadcast message to database:", error);
        }
    });
    
    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});



// Start the server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// app.js
const express = require('express');
const connectDB = require('./config/connection');
const messageRoutes = require('./routes/messages');
const bodyParser = require('body-parser');
const cors = require('cors');
const socketIo = require('socket.io');
const http = require('http');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000', // Replace with your Next.js app URL
        methods: ['GET', 'POST']
    },
});
const port = 4000;

app.use(express.json());
// Middleware
app.use(bodyParser.json());

// Use CORS middleware
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your Next.js app URL
    methods: ['GET', 'POST','PATCH'],
}));
// Connect to MongoDB
connectDB();

// Routes
app.use('/messages', messageRoutes);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});


io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
    socket.on('changeLanguage', async (data, callback) => {
        console.log('Received language change request:', data); // Debugging log
        try {
            const response = await axios.post('http://localhost:4000/messages/translate', {
                language: data.language,
            });
            console.log('Translation response:', response.data); // Debugging log
            callback({ success: true, data: response.data });
        } catch (error) {
            console.error('Error in changeLanguage event:', error);
            callback({ success: false, error: error.message });
        }
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// server.js
const express = require('express')
const mongoose = require('mongoose')
const socketIO = require('socket.io')
const http = require('http')
const app = express()
const server = http.createServer(app)
const io = socketIO(server)
const DraggableItem = require('./models/draggableItem')
const authRoutes = require('./routes/authRoutes')
const { redisClient } = require('./redis')

// Connect to MongoDB
mongoose.connect('mongodb://localhost/drag_and_drop_app')
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Express middleware setup (body parser, cors, etc.)

// Define API routes
// API routes
app.use('/api/auth', authRoutes) // Use the auth routes
app.use('/api/draggable', require('./routes/draggableRoutes'))

// Socket.io setup for real-time communication
// Socket.io setup
io.on('connection', (socket) => {
  console.log('User connected')

  // Join a room (if needed)
  socket.join('dragging-room')

  // Handle socket events for real-time communication
  socket.on('draggedItem', async (itemId, newPosition) => {
    // Update the position of the item in the database
    try {
      const item = await DraggableItem.findById(itemId)
      if (item) {
        item.position = newPosition
        await item.save()
        // Update the cached data in Redis
        redisClient.del('draggableItems') // Delete the cached data
        // Broadcast the updated item to all connected clients
        io.to('dragging-room').emit('updatedItem', item)
      }
    } catch (err) {
      console.error(err)
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected')
  })
})

// Start the server
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

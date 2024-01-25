// models/DraggableItem.js
const mongoose = require('mongoose')

const draggableItemSchema = new mongoose.Schema({
  position: { type: {} },
  userId: { type: mongoose.Types.ObjectId, required: true }
  // Add other properties as needed
})

module.exports = mongoose.model('DraggableItem', draggableItemSchema)

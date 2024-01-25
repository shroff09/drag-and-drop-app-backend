// routes/draggableRoutes.js
const express = require('express')
const router = express.Router()
const { authenticateUser } = require('../controllers/authController')
const DraggableItem = require('../models/draggableItem')
const { redisClient } = require('../redis')

// Get all draggable items
router.get('/', authenticateUser, async (req, res) => {
  try {
    // Check if data is available in the cache
    redisClient.get('draggableItems', async (err, data) => {
      if (err) throw err
      if (data) {
        // If cached data is available, return it
        res.json(JSON.parse(data))
      } else {
        // If not, fetch data from the database
        const items = await DraggableItem.find()
        // Cache the data in Redis for future requests
        redisClient.set('draggableItems', JSON.stringify(items), 'EX', 3600, (err) => {
          if (err) {
            console.error('Error caching data:', err)
          }
        })
        res.json(items)
      }
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
})

// Get a specific draggable item
router.get('/:id', authenticateUser, getDraggableItem, (req, res) => {
  res.json(res.draggableItem)
})

// Create a draggable item
router.post('/', authenticateUser, async (req, res) => {
  const item = new DraggableItem({
    position: req.body.position,
    userId: req.body.userId
  })

  try {
    const newItem = await item.save()
    res.status(201).json(newItem)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Update a draggable item
router.patch('/:id', authenticateUser, getDraggableItem, async (req, res) => {
  if (req.body.position != null) {
    res.draggableItem.position = req.body.position
  }
  // Update other properties as needed
  try {
    const updatedItem = await res.draggableItem.save()
    res.json(updatedItem)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Delete a draggable item
router.delete('/:id', authenticateUser, getDraggableItem, async (req, res) => {
  try {
    await res.draggableItem.remove()
    res.json({ message: 'Deleted DraggableItem' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Middleware to get a specific draggable item by ID
async function getDraggableItem(req, res, next) {
  let draggableItem
  try {
    draggableItem = await DraggableItem.findById(req.params.id)
    if (draggableItem == null) {
      return res.status(404).json({ message: 'Cannot find DraggableItem' })
    }
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }

  res.draggableItem = draggableItem
  next()
}

module.exports = router

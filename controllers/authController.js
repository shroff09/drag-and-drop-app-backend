// controllers/authController.js
const jwt = require('jsonwebtoken')
const User = require('../models/Users')

const generateToken = (user) => {
  return jwt.sign({ userId: user._id }, 'uJ6xGt8n$FpR2hE*', { algorithm: 'HS256' }, { expiresIn: '1h' })
}

const authenticateUser = (req, res, next) => {
  const token = req.header('Authorization')

  if (!token) {
    return res.status(401).json({ message: 'Authentication failed: No token provided' })
  }

  try {
    const tokenWithoutBearer = token.replace('Bearer ', '')
    const decoded = jwt.verify(tokenWithoutBearer, 'uJ6xGt8n$FpR2hE*', { algorithms: ['HS256'] })
    req.userId = decoded.userId
    next()
  } catch (err) {
    console.log(err)
    res.status(401).json({ message: 'Authentication failed: Invalid token' })
  }
}

const registerUser = async (req, res) => {
  const { username, password } = req.body

  try {
    const existingUser = await User.findOne({ username })

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with the provided username' })
    }

    const newUser = new User({ username, password })
    await newUser.save()

    const token = generateToken(newUser)
    res.status(201).json({ token })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const loginUser = async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await User.findOne({ username })

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid username or password' })
    }

    const token = generateToken(user)
    res.json({ user, token })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { generateToken, authenticateUser, loginUser, registerUser }

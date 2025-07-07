const bcrypt = require('bcrypt');
const User = require('../models/User');

// ✅ Register a new user
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ msg: 'Email already in use' });
    }

    // Hash the password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ msg: 'User registered', userId: newUser._id });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server error during registration' });
  }
};

// ✅ Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: 'Invalid credentials' });

    // Compare entered password with stored hash
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ msg: 'Invalid credentials' });

    // 🔐 Placeholder for JWT token 
    res.status(200).json({ msg: 'Login successful', userId: user._id });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error during login' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};


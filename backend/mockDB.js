// // This file provides a mock implementation to bypass MongoDB dependency for testing
// const express = require('express');
// const cors = require('cors');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');

// // Mock users database
// const users = [];

// // Initialize express app
// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// app.get('/', (req, res) => {
//   res.json({ message: 'Mock API is running' });
// });

// // Register route
// app.post('/api/auth/register', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
    
//     // Check if user already exists
//     const existingUser = users.find(user => user.email === email);
//     if (existingUser) {
//       return res.status(400).json({ message: 'User with this email already exists' });
//     }
    
//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);
    
//     // Create new user
//     const newUser = {
//       id: Date.now().toString(),
//       name,
//       email,
//       password: hashedPassword
//     };
    
//     users.push(newUser);
    
//     // Generate JWT token
//     const token = jwt.sign(
//       { userId: newUser.id },
//       'mock-secret-key',
//       { expiresIn: '7d' }
//     );
    
//     console.log(`New user registered: ${email}`);
    
//     res.status(201).json({
//       token,
//       user: {
//         id: newUser.id,
//         name: newUser.name,
//         email: newUser.email
//       }
//     });
//   } catch (error) {
//     console.error('Error in user registration:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Login route
// app.post('/api/auth/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     // Find user by email
//     const user = users.find(user => user.email === email);
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
    
//     // Validate password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
    
//     // Generate JWT token
//     const token = jwt.sign(
//       { userId: user.id },
//       'mock-secret-key',
//       { expiresIn: '7d' }
//     );
    
//     console.log(`User logged in: ${email}`);
    
//     res.json({
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email
//       }
//     });
//   } catch (error) {
//     console.error('Error in user login:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Start server
// const PORT = 5001;
// app.listen(PORT, () => {
//   console.log(`Mock server running on port ${PORT}`);
// });

// // Export the app for testing
// module.exports = app; 

// THIS FILE HAS BEEN COMMENTED OUT TO CHECK IF THE MONGO DB IS WORKING
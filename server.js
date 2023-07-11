

const express = require('express');

const cors = require('cors');

const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

const mongoose = require('mongoose');

const app = express();

app.use(express.json());






app.use(cors());

mongoose.connect('mongodb+srv://Prateek:EjCOPVeGUt3mVxBR@cluster0.ukgaesh.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });




const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String
});

const User = mongoose.model('User', UserSchema);

const secretKey = 'prateek12345678987843245458dfdf';


app.post('/api/register', async (req, res) => {
    const { username, password, name } = req.body;
  
    try {
      // Check if the username is already taken
      const existingUser = await User.findOne({ username });
  
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }
  
      // Generate a salt and hash the password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
  
      // Create a new user object
      const newUser = new User({
        username,
        password: hashedPassword,
        name
      });
  
      // Save the new user to the database
      const savedUser = await newUser.save();
  
      // Generate JWT token
      const token = jwt.sign({ userId: savedUser._id }, secretKey, { expiresIn: '1h' });
  
      // Return token and user details
      res.json({ token, user: { id: savedUser._id, username: savedUser.username, name: savedUser.name } });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).json({ message: 'An error occurred' });
    }
  });


  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const user = await User.findOne({ username });
  
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
      res.json({ token, user: { id: user._id, username: user.username, name: user.name } });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).json({ message: 'An error occurred' });
    }
  });
  
  app.post('/api/logout', (req, res) => {
    try {
      res.json({ message: 'Logged out successfully' });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).json({ message: 'An error occurred' });
    }
  });
  


const port = 5000;

app.listen(port, () => {

  console.log(`Server running on port ${port}`);

});

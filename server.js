const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files like CSS

// Set view engine to EJS
app.set('view engine', 'ejs');

// MongoDB connection
const uri = 'mongodb://127.0.0.1:27017/personDB'; // Ensure MongoDB is running locally
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB:', err));

// MongoDB Schema and Model
const personSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String, // 'M' or 'F'
  mobile: String,
});

const Person = mongoose.model('Person', personSchema);

// Routes

// GET /person - Display list of people
app.get('/person', async (req, res) => {
  try {
    const people = await Person.find();
    res.render('index', { people });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// GET /person/new - Form to create a new person
app.get('/person/new', (req, res) => {
  res.render('new');
});

// POST /person - Create a new person
app.post('/person', async (req, res) => {
  try {
    const { name, age, gender, mobile } = req.body;
    const newPerson = new Person({ name, age, gender, mobile });
    await newPerson.save();
    res.redirect('/person');
  } catch (err) {
    res.status(500).send('Error saving person');
  }
});

// GET /person/edit/:id - Form to edit a person
app.get('/person/edit/:id', async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) return res.status(404).send('Person not found');
    res.render('edit', { person });
  } catch (err) {
    res.status(500).send('Error fetching person');
  }
});

// POST /person/edit/:id - Update a person
app.post('/person/edit/:id', async (req, res) => {
  try {
    const { name, age, gender, mobile } = req.body;
    await Person.findByIdAndUpdate(req.params.id, { name, age, gender, mobile });
    res.redirect('/person');
  } catch (err) {
    res.status(500).send('Error updating person');
  }
});

// GET /person/delete/:id - Confirmation page for deletion (optional)
app.get('/person/delete/:id', async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) return res.status(404).send('Person not found');
    res.render('delete', { person });
  } catch (err) {
    res.status(500).send('Error fetching person');
  }
});

// POST /person/delete/:id - Delete a person
app.post('/person/delete/:id', async (req, res) => {
  try {
    await Person.findByIdAndDelete(req.params.id);
    res.redirect('/person');
  } catch (err) {
    res.status(500).send('Error deleting person');
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

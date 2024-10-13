const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());

// CORS configuration
const corsOptions = {
    origin: 'https://gtc-interviewer-dashboard.vercel.app', // Replace with your frontend's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// MongoDB connection
mongoose.connect("mongodb+srv://db:db1@cluster0.h3odo.mongodb.net/registration?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define schema for candidate data
const candidateSchema = new mongoose.Schema({
  email: String,
  full_name: String,
  phone_number: Number,
  admission_number: String,
  course: String,
  year: String,
  division: String,
  github_profile: String,
  technical_skills: String
});

// Define schema for interviewed candidates
const interviewedCandidateSchema = new mongoose.Schema({
  email: String,
  full_name: String,
  phone_number: Number,
  admission_number: String,
  division: String, // Add division field
  technical_skills: String,
  status: String // Add status field to track candidate status
});

// Create models, specifying the collection names correctly
const Candidate = mongoose.model('Candidate', candidateSchema, 'User-data'); // Original candidates collection
const InterviewedCandidate = mongoose.model('InterviewedCandidate', interviewedCandidateSchema, 'Interviewed-Candidates'); // New collection for interviewed candidates

// Endpoint to fetch data
app.get('/api/candidates', async (req, res) => {
  const { admission_number, division } = req.query;

  try {
    const candidate = await Candidate.findOne({ 
      admission_number: { $regex: new RegExp(`^${admission_number}$`, 'i') }, // Case-insensitive regex
      division: division 
  });

    if (candidate) {
      res.json(candidate);
    } else {
      res.status(404).json({ message: 'Candidate not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// New endpoint to update candidate status in a separate collection
app.post('/api/update-candidate', async (req, res) => {
  const { name, admission_number, mobile_number, email, skills, status, division } = req.body; // Include division

  try {
    // Save the candidate's status in the new collection
    const interviewedCandidate = new InterviewedCandidate({
      full_name: name,
      admission_number,
      phone_number: mobile_number,
      email,
      division, // Add division to the document
      technical_skills: skills,
      status // Add the status to the document
    });

    await interviewedCandidate.save();
    res.status(201).json({ message: 'Candidate status updated successfully in Interviewed-Candidates collection' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating candidate status' });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

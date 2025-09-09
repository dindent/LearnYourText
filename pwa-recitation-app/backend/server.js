const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/texts', require('./routes/texts'));
// app.use('/api/theatre', require('./routes/theatre'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mainRouter = require('./src/routes/index');
const { errorHandler } = require('./src/middleware/error.handler');
const { swaggerUi, specs } = require("./src/config/swagger");

const app = express();

// --- Core Middleware ---

// 1. Set up CORS correctly HERE, at the top
// This is the ONLY app.use(cors()) you should have.
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true // This allows cookies
}));

// 2. Body and Cookie Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- API Router ---
// This must come AFTER the core middleware
app.use('/api/v1', mainRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));


// --- Health Check ---
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is healthy' });
});

// --- Global Error Handler ---
// This must be the LAST middleware
app.use(errorHandler);

module.exports = app;
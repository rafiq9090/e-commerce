const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const mainRouter = require('./src/routes/index');
const { errorHandler } = require('./src/middleware/error.handler');
const { swaggerUi, specs } = require("./src/config/swagger");

const app = express();

// --- Core Middleware ---

// Request logging
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

// 1. Set up CORS correctly HERE, at the top
// This is the ONLY app.use(cors()) you should have.
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: corsOrigins,
  credentials: true // This allows cookies
}));

// 2. Body and Cookie Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later.' }
});

app.use('/api/v1', apiLimiter);
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1/admin/login', authLimiter);

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

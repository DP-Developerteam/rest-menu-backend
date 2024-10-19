// Imports
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import connection to DB
const { connect } = require('./api/utils/database/connect.js');

// Express APIs
const userRoutes = require('./api/routes/user.routes.js');
const productRoutes = require('./api/routes/product.routes.js');

// Initialize Express app
const app = express();

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Serve public files. styles.css & favicon.ico
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);

// Serve HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// // Database Connection and Server Start
// (async () => {
//     try {
//         await connect(); // Ensure DB connection happens first
//         const port = process.env.PORT || 4000;
//         app.listen(port, () => {
//             console.log(`Server running on port ${port}`);
//         });
//     } catch (err) {
//         console.error('Failed to connect to the database', err);
//         process.exit(1); // Exit with failure
//     }
// })();

// Connect to the database and set up routes
const init = async () => {
    await connect(); // Ensure DB connection happens first
};
// Set up your express app as a serverless function
module.exports = async (req, res) => {
    await init(); // Connect to DB for each request
    app(req, res); // Pass request and response to Express app
};

// 404 Handler for undefined routes
app.use((req, res, next) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
    });
});

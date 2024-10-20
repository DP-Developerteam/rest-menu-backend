// Imports
const express = require('express');
const cors = require('cors');
const path = require('path');
// const dotenv = require('dotenv'); *** For local purposes

// Load environment variables *** For local purposes
// dotenv.config();

// Import connection to DB
const { connect } = require('./api/utils/database/connect.js');

// Initialize Express app
const app = express();

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Express APIs
const userRoutes = require('./api/routes/user.routes.js');
const productRoutes = require('./api/routes/product.routes.js');

// Routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);

// Serve public files. styles.css & favicon.ico
app.use(express.static(path.join(__dirname, 'public')));

// Serve HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

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

// Flag to track whether the database connection is established
let isConnected = false;

// Serverless function to connect to DB
const init = async () => {
    // Check if the database is not already connected
    if (!isConnected) {
        // console.log('Connecting to the database...');
        // Call the connect function to establish a database connection
        await connect();
        // Set the flag to true to indicate the database is now connected
        isConnected = true;
        // console.log('Connected to the database');
    }
};

// Export the function to handle incoming requests
module.exports = async (req, res) => {
    try {
        // Ensure the database connection is established before handling the request
        await init();
        // Pass the request and response objects to the Express app for processing
        app(req, res);
    } catch (error) {
        // Handle any errors that occur during request handling
        // console.error('Error during request handling:', error);
        // Send a 500 error response to the client
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// *** For local purposes *** //
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
// const init = async () => {
//     await connect(); // Ensure DB connection happens first
// };
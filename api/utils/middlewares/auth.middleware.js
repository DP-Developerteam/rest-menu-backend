const jwt = require("jsonwebtoken");

// Middleware function to verify JWT
module.exports = (req, res, next) => {
    try {
        // Retrieve the token from the Authorization header
        const token = req.headers.authorization?.split(" ")[1]; // Optional chaining to avoid errors

        // Check if the token exists
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        // Verify the token using a secret key from environment variables
        const secretKey = process.env.JWT_SECRET || "fallback-secret"; // Use environment variable for the secret
        jwt.verify(token, secretKey);

        // Call the next middleware function in the stack
        next();
    } catch (error) {
        // If there's an error, respond with 401 Unauthorized
        res.status(401).json({ message: "Invalid token provided" });
    }
};

// Import Express framework and create a new Router object
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();

// Import the User model for interacting with the MongoDB users collection
const userSchema = require("../models/user.model");
// Import authorization middleware to protect routes
const authorize = require("../utils/middlewares/auth.middleware");
// Import the role middleware
const roleAuthorize = require("../utils/middlewares/role.middleware");
// Import express-validator for validating request data
const { check, validationResult } = require('express-validator');

// Sign-up
router.post("/signup",
    [
        // Validate user input fields
        check('name', 'Name minimum length 3 characters.')
            .not()
            .isEmpty()
            .isLength({ min: 3 }),
        check('username', 'Username must be unique and minimum length 3 characters.')
            .not()
            .isEmpty()
            .isLength({ min: 3 }),
        check('password', 'Password minimum length 5 characters.')
            .not()
            .isEmpty()
            .isLength({ min: 5}),
        check('role', 'Must be either employee or client')
            .not()
            .isEmpty()
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // If validation errors exist, return 422 status with errors
            return res.status(422).json(errors.array());
        }

        try {
            // Check if the username already exists
            const existingUser = await userSchema.findOne({ username: req.body.username });
            if (existingUser) {
                return res.status(409).json({ message: "Username already exists." });
            }

            // Hash the password before saving
            const hash = await bcrypt.hash(req.body.password, 10);
            const user = new userSchema({
                name: req.body.name,
                username: req.body.username,
                password: hash,
                role: req.body.role,
            });
            // Save the user and return success response
            const response = await user.save();
            res.status(201).json({
                message: "User created successfully.",
                result: response
            });
        } catch (error) {
            // Handle any errors that occur during user creation
            res.status(500).json({ error: error.message });
        }
    }
);


// Sign-in
router.post("/signin", async (req, res, next) => {
    try {
        // Fetch user by username
        const user = await userSchema.findOne({ username: req.body.username });
        if (!user) {
            return res.status(401).json({ message: "No user data." });
        }

        // Compare password with hashed password
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Password incorrect." });
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            {
                username: user.username,
                userId: user._id,
                role: user.role // Include the user's role here
            },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        // Return token and user ID
        res.status(200).json({
            token: jwtToken,
            expiresIn: 28800,
            _id: user._id
        });

    } catch (err) {
        // Handle any errors that occur during sign-in
        return res.status(401).json({ message: "Authentication failed." });
    }
});


// Get Users
// router.get('/', authorize, async (req, res, next) => {
router.get('/', authorize, roleAuthorize, async (req, res, next) => {
    try {
        // Fetch all users from the database
        const users = await userSchema.find();
        res.status(200).json(users);
    } catch (error) {
        // Forward any errors to the global error handler
        next(error);
    }
});

// Get  User by ID
router.get('/user/:id', authorize, async (req, res, next) => {
    try {
        // Find user by ID
        const user = await userSchema.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        // Return the found user as JSON
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
});

// Get  User by Name
router.get('/user/name/:name', authorize, roleAuthorize, async (req, res, next) => {
    try {
        const userName = req.params.name;

        // Use the 'find' method with a regular expression to search for users containing the name
        const users = await userSchema.find({ name: { $regex: userName, $options: 'i' } });

        // If no users are found, return a 404 response
        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        // Return the found users as JSON
        res.status(200).json(users);
    } catch (error) {
        // Handle errors
        next(error);
    }
});

// Update User by ID
router.put('/edit/:id', authorize, roleAuthorize, async (req, res, next) => {
    try {
        // Update user details
        const updatedUser = await userSchema.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }
        // Return the updated user as JSON
        res.status(200).json(updatedUser);
    } catch (error) {
        // Forward any errors to the global error handler
        next(error);
    }
});


// Delete User by ID
router.delete('/delete/:id', authorize, roleAuthorize, async (req, res, next) => {
    try {
        // Find and delete the user by ID
        const deletedUser = await userSchema.findByIdAndRemove(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found." });
        }
        // Return the deleted user as JSON
        res.status(200).json(deletedUser);
    } catch (error) {
        // Forward any errors to the global error handler
        next(error);
    }
});

module.exports = router;
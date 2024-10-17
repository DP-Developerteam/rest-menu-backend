// Import Express framework and create a new Router object
const express = require("express");
const router = express.Router();

// Import authorization middleware to protect routes
const authorize = require("../utils/middlewares/auth.middleware");

// Import the Product model for interacting with the MongoDB products collection
const productSchema = require(`../models/product.model`);

// Route to get all products, requires authorization
router.route('/').get(authorize, async (req, res, next) => {
    try {
        // Fetch all products from the database, and populate the 'client' field with user data
        const products = await productSchema.find().populate('client');

        // Return the fetched products as JSON
        res.status(200).json(products);
    } catch (error) {
        // Forward any errors to the global error handler
        next(error);
    }
});

// Route to get products filtered by client name
router.route('/product/:clientName').get(authorize, async (req, res, next) => {
    try {
        const clientName = req.params.clientName;

        // Aggregation pipeline to match products by client name
        const productsByClient = await productSchema.aggregate([
            {
                $lookup: {
                    from: 'users', // Reference to the users collection
                    localField: 'client', // Match by the 'client' field in products
                    foreignField: '_id', // Match it to the '_id' field in the users collection
                    as: 'clientDetails' // Store the result in 'clientDetails'
                }
            },
            {
                $match: {
                    'clientDetails.name': clientName // Only return products for clients with the specified name
                }
            }
        ]);

        // Return the filtered products as JSON
        res.status(200).json(productsByClient);
    } catch (error) {
        // Forward any errors to the global error handler
        next(error);
    }
});

// Route to get a specific product by its ID
router.route('/product/:id').get(authorize, async (req, res, next) => {
    try {
        // Find the product by ID
        const product = await productSchema.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        // Return the product as JSON
        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
});

// Route to create a new product
router.route('/create').post(authorize, async (req, res, next) => {
    try {
        // Create a new product document with data from the request body
        const newProduct = new productSchema({
            client: req.body.client,
            dateStart: req.body.dateStart,
            dateEnd: req.body.dateEnd,
            description: req.body.description,
        });

        // Save the new product to the database
        const createdProduct = await newProduct.save();
        return res.status(201).json(createdProduct); // Return the created product with a 201 Created status
    } catch (err) {
        // Forward any errors to the global error handler
        return next(err);
    }
});

// Route to delete a product by ID
router.route('/delete/:id').delete(authorize, async (req, res, next) => {
    try {
        const { id } = req.params;
        // Find and delete the product by its ID
        const productDeleted = await productSchema.findByIdAndDelete(id);
        if (!productDeleted) {
            return res.status(404).json({ message: "Product not found" });
        }
        // Return the deleted product as JSON
        return res.status(200).json(productDeleted);
    } catch (err) {
        // Forward any errors to the global error handler
        return next(err);
    }
});

// Route to edit a product by ID
router.route('/edit/:id').put(authorize, async (req, res, next) => {
    try {
        const { id } = req.params;
        // Create a new product object with updated data from the request body
        const productModify = new productSchema(req.body);
        productModify._id = id; // Set the ID of the product to the existing ID

        // Find the product by ID and update it with the new data
        const productUpdated = await productSchema.findByIdAndUpdate(id, productModify, { new: true }); // Option to return the updated product
        if (!productUpdated) {
            return res.status(404).json({ message: "Product not found" });
        }
        // Return the updated product as JSON
        return res.status(200).json(productUpdated);
    } catch (err) {
        // Forward any errors to the global error handler
        return next(err);
    }
});

// Export the router to be used in the application
module.exports = router;
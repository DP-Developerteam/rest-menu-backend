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
        // Fetch all products from the database
        const products = await productSchema.find();
        // Return the fetched products as JSON
        res.status(200).json(products);
    } catch (error) {
        // Forward any errors to the global error handler
        next(error);
    }
});

// Route to get products filtered by product name
router.route('/product/:name').get(async (req, res, next) => {
    try {
        const productName = req.params.name;

        // Use the 'find' method with a regular expression to search for products containing the name
        const products = await productSchema.find({ name: { $regex: productName, $options: 'i' } });

        // If no products are found, return a 404 response
        if (products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }

        // Return the found products as JSON
        res.status(200).json(products);
    } catch (error) {
        // Handle errors
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
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            ingredients: req.body.ingredients,
            image: req.body.image,
            video: req.body.video,
            category: req.body.category,
            vegetarian: req.body.vegetarian,
            dateAdded: req.body.dateAdded
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
        // Update product details
        const updatedProduct = await productSchema.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        // Return the updated product as JSON
        return res.status(200).json(updatedProduct);
    } catch (err) {
        // Forward any errors to the global error handler
        return next(err);
    }
});

// Export the router to be used in the application
module.exports = router;
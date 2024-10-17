// Require library mongoose
const mongoose = require(`mongoose`);

// Require environment variables
const dotenv = require("dotenv");
dotenv.config(); // Load .env variables into process.env

// Get the MongoDB connection string from environment variables
const mongoDb = process.env.MONGO_DB;

// Require the Product model
const Product = require(`../models/product.model`);

// Create an array of seed product documents
const products = [
    {
        name: "Margarita",
        price: 10,
        ingredients: ["Harina de trigo", "Tomate", "Mozzarella", "Basílico"],
        image: "https://www.annarecetasfaciles.com/files/pizza-margarita-1-scaled.jpg",
        category: "Pizzas",
        vegetarian: true,
    },
    {
        name: `Agua con gas`,
        price: 3,
        ingredients: [`agua`],
        image: `https://www.bodecall.com/images/stories/virtuemart/product/agua-vichy-catalan-25-cl.png`,
        category: "Bebidas",
        vegetarian: true,
    }
];

// Create Product documents from the products array
const productDocuments = products.map(product => new Product(product));

// Set mongoose options for queries
mongoose.set('strictQuery', true);

// Main function to seed the database
(async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoDb, {
            useNewUrlParser: true, // Use the new URL string parser
            useUnifiedTopology: true, // Use the new server discovery and monitoring engine
        });

        // Check if there are existing products in the database
        const allProduct = await Product.find();
        if (allProduct.length) {
            // If products exist, drop the collection
            await Product.collection.drop();
        }

        // Insert the new product documents into the database
        await Product.insertMany(productDocuments);
        console.log('Database Created'); // Log a success message
    } catch (err) {
        console.error(`Error: ${err}`); // Log any errors that occur
    } finally {
        mongoose.disconnect(); // Disconnect from the database after operations are complete
    }
})();

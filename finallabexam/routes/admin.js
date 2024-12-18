const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const Order = require("../models/Order");
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const session = require('express-session');

router.use(cookieParser());
router.use(
  session({
    secret: 'mySecretKey', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true },
  })
);

// Hardcoded Admin Credentials (username & hashed password)
const adminUsername = 'ishaabid';
const adminPasswordHash = bcrypt.hashSync('12345', 10); 

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.isAdmin) {
    next();
  } else {
    res.redirect('/login');
  }
}

router.get('/',(req,res)=>{
  res.render('user');
})

// SHOPPING CART AND CHECKOUT ROUTES
// Route: Show Shopping Cart
router.get('/cart', (req, res) => {
  const cartItems = req.session.cart || []; // Retrieve cart from session
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.render('cart', { cartItems, totalAmount });
});

// Route: Add item to Cart
router.post('/cart/add', (req, res) => {
  const { id, name, price, quantity } = req.body;
  const cart = req.session.cart || [];
  
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ id, name, price, quantity });
  }
  req.session.cart = cart;
  res.redirect('/cart');
});

// Route: Checkout
router.post('/cart/checkout', async (req, res) => {
  const { name, street, city, postalCode } = req.body;

  if (!name || !street || !city || !postalCode) {
    return res.status(400).send('All fields are required.');
  }

  const cartItems = req.session.cart || [];

  // Sanitize and process the cart items
  const sanitizedItems = cartItems.map((item) => {
    const numericPrice = parseFloat(item.price.replace(/[^0-9.-]+/g, '')); // Remove non-numeric characters
    return {
      ...item,
      price: numericPrice, // Ensure price is numeric
      total: numericPrice * item.quantity, // Add a total field for each item
    };
  });

  // Calculate the total amount
  const totalAmount = sanitizedItems.reduce((sum, item) => sum + item.total, 0);

  if (sanitizedItems.length === 0 || isNaN(totalAmount)) {
    return res.status(400).send('Invalid cart items or total amount.');
  }

  const newOrder = new Order({
    orderID: `ORD-${Date.now()}`,
    customerInfo: { name, street, city, postalCode },
    items: sanitizedItems,
    totalAmount,
  });

  try {
    await newOrder.save();
    req.session.cart = []; // Clear the cart after checkout
    res.redirect('/cart/success');
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).send('Failed to place order.');
  }
});


// Route: Success Page
router.get('/cart/success', (req, res) => {
  res.render('success'); // Render a simple success message
});

// ADMIN PANEL ORDER MANAGEMENT ROUTES
// Route: Fetch All Orders
router.get('/dashboard/orders', isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 }); // Fetch and sort orders
    res.render('orders', { orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Internal Server Error');
  }
});


// READ: Display all items
router.get("/products", async (req, res) => {
  try {
    const items = await Item.find(); // Fetch items from the database
    res.render("products", { items }); // Pass 'items' to the view
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Route: Show Login Page
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Route: Handle Login Logic
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Check if username matches
  if (username === adminUsername) {
    // Compare hashed password
    const passwordMatch = await bcrypt.compare(password, adminPasswordHash);

    if (passwordMatch) {
      req.session.isAdmin = true; // Set session for admin
      return res.redirect('/dashboard'); // Redirect to the dashboard
    }
  }
  // On failure
  res.render('login', { error: 'Invalid Credentials. Please try again.' });
});

router.get("/dashboard", isAuthenticated, async (req, res) => {
  res.render("dashboard");
});

// READ: Display all items
router.get("/dashboard/read", isAuthenticated, async (req, res) => {
  const items = await Item.find();
  res.render("read", { items });
});

// CREATE: Render form 
router.get("/dashboard/create", isAuthenticated, (req, res) => {
  res.render("create", { error: null });
});

// Handle submission to create or update an item
router.post("/dashboard/create", isAuthenticated, async (req, res) => {
  const { name, price, description, quantity, image } = req.body;
  try {
    const existingItem = await Item.findOne({ name });

    if (existingItem) {
      existingItem.price = price;
      existingItem.description = description;
      existingItem.image = image;
      await existingItem.save();
      return res.redirect("read");
    } else {
      await Item.create({ name, price, description, quantity, image });
      return res.redirect("read");
    }
  } catch (error) {
    console.error('Error saving item:', error.message);
    res.status(500).send('Error saving item: ' + error.message);
  }
});

// UPDATE: Render edit form and handle submission
router.get('/dashboard/edit/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).send('Item not found');
    }
    res.render('edit', { item });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/dashboard/edit/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const item = await Item.findByIdAndUpdate(id, updatedData, { new: true });
    if (!item) {
      return res.status(404).send('Item not found');
    }

    // Redirect after update
    res.redirect('/dashboard/read');
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).send('Internal Server Error');
  }
});

// DELETE: Remove an item
router.post("/dashboard/delete/:id", isAuthenticated, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.redirect("/dashboard/read");
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route: Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

module.exports = router;
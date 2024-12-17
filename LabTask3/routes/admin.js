const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

//READ: Display all items
router.get("/", async (req, res) => {
  const items = await Item.find();
  res.render("read", { items });
});

//CREATE: Render form 
router.get("/create", (req, res) => {
  res.render("create",{error:null});
});
// handle submission
router.post("/create", async (req, res) => {
  const { name, price, description, quantity, image } = req.body;
  try {
    const existingItem = await Item.findOne({ name });

    if (existingItem) {
      existingItem.price = price;
      existingItem.description = description;
      existingItem.image = image;
      await existingItem.save();
      return res.redirect("/admin");
    } else {
      await Item.create({ name, price, description, quantity, image });
      return res.redirect("/admin");
    }
  } catch (error) {
    console.error('Error saving item:', error.message);  // Log error if occurs
    res.status(500).send('Error saving item: ' + error.message);
  }
});



//UPDATE: Render edit form and handle submission
router.get('/edit/:id', async (req, res) => {
  try {
    const { id } = req.params; // Extract item ID from the URL
    const item = await Item.findById(id); // Fetch item from database
    if (!item) {
      return res.status(404).send('Item not found');
    }
    res.render('edit', { item }); // Pass the item to the template
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/edit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body; // Data from the form submission

    const item = await Item.findByIdAndUpdate(id, updatedData, { new: true });
    if (!item) {
      return res.status(404).send('Item not found');
    }

    // Redirect or send a success response
    res.redirect('/admin'); // Replace with the desired redirect path
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).send('Internal Server Error');
  }
});


//DELETE: Remove an item
router.post("/delete/:id", async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
});

module.exports = router;

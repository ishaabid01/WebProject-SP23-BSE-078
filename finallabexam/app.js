const express = require("express");;
const bodyParser = require('body-parser');
const methodOverride = require("method-override");
const adminRoutes = require("./routes/admin");
const connectdb = require("./db");

const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set EJS as the view engine
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use('/public', express.static('uploads')); 

// Routes
app.use(adminRoutes);

const PORT = 1370;

async function startServer() {
  try {
    await connectdb(); 
    console.log("Database connected successfully!");

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server started at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start the server:", err);
  }
}

startServer();

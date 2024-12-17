
const mongoose = require("mongoose");

const connectDB = async () => {

    
  const connectionString = "mongodb://localhost:27017/ProductController"; // 
 try {
    await mongoose.connect(connectionString);
    useNewUrlParser: true,
 
    
    console.log("Connected to MongoDB");

  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
};

module.exports = connectDB;

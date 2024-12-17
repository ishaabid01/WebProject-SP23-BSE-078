
const mongoose = require("mongoose");

const connectDB = async () => {

    
  const connectionString = "mongodb://localhost:27017/dashboard"; // 
 try {
    await mongoose.connect(connectionString);
    useNewUrlParser: true,
 
    
    console.log("Connected to MongoDB");

  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit the process if the connection fails
  }
};

module.exports = connectDB;

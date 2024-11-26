const express = require('express');
let server = express();

server.set("view engine","ejs");

server.use(express.static("Public"))

server.get("/",(req,res)=>{
    res.render("hushpuppies");
  });

  server.get("/form",(req,res)=>{
    res.render("form");
  });

server.listen(3000, () => {
    console.log('Server is running on port localhost:3000');
})

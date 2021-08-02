//jshint esversion:6
//require dotenv to store environment variables separately and refer to them here.
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//Create object from mongoose schema class to use encrypt package below
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

//Add encrypt package as a plugin to extend functionality of schema to encrypt password
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  //Note: Mongoose will auto encrypt on save() method
  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;
  //Note: mongoose will auto decrypt on find() method
  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    } else {
      if(foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
          console.log(foundUser.password);
        }
      }
    }
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000.")
});

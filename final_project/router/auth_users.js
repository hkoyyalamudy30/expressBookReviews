const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  return users.some(u => u.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  return users.some(u => u.username === username && u.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "invalid username or password" });
  }

  const accessToken = jwt.sign({ username }, "access", { expiresIn: 60 * 60 });
  req.session.authorization = { accessToken, username };

  return res.status(200).json({ message: "login successful" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!req.session || !req.session.authorization) {
    return res.status(401).json({ message: "user not logged in" });
  }

  if (!review) {
    return res.status(400).json({ message: "review query is required" });
  }

  const username = req.session.authorization.username;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "no book found for this isbn" });
  }

  if (!book.reviews) {
    book.reviews = {};
  }

  // add or update the review from this user
  book.reviews[username] = review;

  return res.status(200).json({
    message: "review added or modified",
    reviews: book.reviews
  });
});

// Delete a book review by the logged in user
regd_users.delete("/auth/review/:isbn", (req, res) => {
  if (!req.session || !req.session.authorization) {
    return res.status(401).json({ message: "user not logged in" });
  }

  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "no book found for this isbn" });
  }

  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "no review by this user for this isbn" });
  }

  delete book.reviews[username];

  return res.status(200).json({
    message: "review deleted",
    reviews: book.reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

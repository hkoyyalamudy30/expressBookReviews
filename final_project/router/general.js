const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");


public_users.post("/register", (req,res) => {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  }

  const exists = users.find(u => u.username === username);
  if (exists) {
    return res.status(409).json({ message: "username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "user registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).send(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "no book found for this isbn" });
  }

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).send(JSON.stringify(book, null, 2));
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
  const authorParam = req.params.author.toLowerCase();
  const result = {};

  const isbns = Object.keys(books);
  for (const isbn of isbns) {
    const book = books[isbn];
    if (book.author && book.author.toLowerCase() === authorParam) {
      result[isbn] = book;
    }
  }

  if (Object.keys(result).length === 0) {
    return res.status(404).json({ message: "no books found for this author" });
  }

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).send(JSON.stringify(result, null, 2));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
  const titleParam = req.params.title.toLowerCase();
  const result = {};

  const isbns = Object.keys(books);
  for (const isbn of isbns) {
    const book = books[isbn];
    if (book.title && book.title.toLowerCase() === titleParam) {
      result[isbn] = book;
    }
  }

  if (Object.keys(result).length === 0) {
    return res.status(404).json({ message: "no books found with this title" });
  }

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).send(JSON.stringify(result, null, 2));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "no book found for this isbn" });
  }

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).send(JSON.stringify(book.reviews || {}, null, 2));
});

public_users.get("/books/async", async function (req, res) {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}/`;
    const response = await axios.get(baseUrl);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(response.data, null, 2));
  } catch (err) {
    return res.status(500).json({ message: "failed to fetch books" });
  }
});


public_users.get("/isbn/:isbn/async", async function (req, res) {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const { isbn } = req.params;

    // call the existing sync route made in task 2
    const response = await axios.get(`${baseUrl}/isbn/${isbn}`);

    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(response.data, null, 2));
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(500).json({ message: "failed to fetch book" });
  }
});


public_users.get("/author/:author/async", async function (req, res) {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const author = encodeURIComponent(req.params.author);
    const response = await axios.get(`${baseUrl}/author/${author}`);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(response.data, null, 2));
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(500).json({ message: "failed to fetch author books" });
  }
});

public_users.get("/title/:title/async", async function (req, res) {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const title = encodeURIComponent(req.params.title);
    const response = await axios.get(`${baseUrl}/title/${title}`);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(response.data, null, 2));
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(500).json({ message: "failed to fetch title books" });
  }
});


module.exports.general = public_users;

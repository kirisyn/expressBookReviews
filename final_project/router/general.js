const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Returns the books whose given field matches the value, keyed by ISBN like the books object
const filterBooks = (field, value) => {
  const matches = {};
  Object.keys(books).forEach((isbn) => {
    if (books[isbn][field] === value) {
      matches[isbn] = books[isbn];
    }
  });
  return matches;
}


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  if (isValid(username)) {
    return res.status(409).json({message: "User already exists"});
  }
  users.push({username: username, password: password});
  return res.status(201).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }
  return res.send(JSON.stringify(book, null, 4));
 });

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const matches = filterBooks("author", req.params.author);
  if (Object.keys(matches).length === 0) {
    return res.status(404).json({message: "No books found for this author"});
  }
  return res.send(JSON.stringify(matches, null, 4));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const matches = filterBooks("title", req.params.title);
  if (Object.keys(matches).length === 0) {
    return res.status(404).json({message: "No books found with this title"});
  }
  return res.send(JSON.stringify(matches, null, 4));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }
  return res.send(JSON.stringify(book.reviews, null, 4));
});

module.exports.general = public_users;

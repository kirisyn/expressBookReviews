const express = require('express');
const axios = require('axios');
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

// Tasks 10-13: the same lookups as Tasks 1-4, done with async-await and Axios.
// Each function below requests the matching route of this server and returns the response body.
const BASE_URL = "http://localhost:5000";

// Task 10: get the list of books available in the shop
const getAllBooks = async () => {
  const response = await axios.get(`${BASE_URL}/`);
  return response.data;
}

// Task 11: get book details based on ISBN
const getBookByISBN = async (isbn) => {
  const response = await axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`);
  return response.data;
}

// Task 12: get book details based on author
const getBooksByAuthor = async (author) => {
  const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
}

// Task 13: get book details based on title
const getBooksByTitle = async (title) => {
  const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
  return response.data;
}

// Answers with the status and body Axios received when the request failed, e.g. a 404 for an unknown ISBN
const sendAxiosError = (res, error) => {
  if (error.response) {
    return res.status(error.response.status).json(error.response.data);
  }
  return res.status(500).json({message: "Unable to retrieve the books"});
}

// Task 10: get the book list available in the shop using async-await with Axios
public_users.get('/async/books', async function (req, res) {
  try {
    const bookList = await getAllBooks();
    return res.send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return sendAxiosError(res, error);
  }
});

// Task 11: get book details based on ISBN using async-await with Axios
public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    const book = await getBookByISBN(req.params.isbn);
    return res.send(JSON.stringify(book, null, 4));
  } catch (error) {
    return sendAxiosError(res, error);
  }
});

// Task 12: get book details based on author using async-await with Axios
public_users.get('/async/author/:author', async function (req, res) {
  try {
    const matches = await getBooksByAuthor(req.params.author);
    return res.send(JSON.stringify(matches, null, 4));
  } catch (error) {
    return sendAxiosError(res, error);
  }
});

// Task 13: get all books based on title using async-await with Axios
public_users.get('/async/title/:title', async function (req, res) {
  try {
    const matches = await getBooksByTitle(req.params.title);
    return res.send(JSON.stringify(matches, null, 4));
  } catch (error) {
    return sendAxiosError(res, error);
  }
});

module.exports.general = public_users;

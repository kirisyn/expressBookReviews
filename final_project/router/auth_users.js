const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  // a username is valid when it belongs to a registered user
  return users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({message: "Invalid login. Check username and password"});
  }
  // the auth middleware in index.js verifies this token on every /customer/auth/* request
  const accessToken = jwt.sign({username: username}, "access", {expiresIn: 60 * 60});
  req.session.authorization = {accessToken: accessToken, username: username};
  return res.status(200).json({message: "User successfully logged in"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  if (!review) {
    return res.status(400).json({message: "Provide the review text in the 'review' query parameter"});
  }
  // one review per user per book: posting again replaces the user's previous review
  const action = Object.hasOwn(books[isbn].reviews, username) ? "modified" : "added";
  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: `Review by ${username} for the book with ISBN ${isbn} ${action}`,
    reviews: books[isbn].reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  // users can only delete their own review, never the ones posted by others
  if (!Object.hasOwn(books[isbn].reviews, username)) {
    return res.status(404).json({message: `No review by ${username} for the book with ISBN ${isbn}`});
  }
  delete books[isbn].reviews[username];
  return res.status(200).json({
    message: `Review by ${username} for the book with ISBN ${isbn} deleted`,
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

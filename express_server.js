const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { getUserByEmail } = require('./helpers.js');
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'user_id',
  keys: ['first key', 'yet another key']
}));
app.set("view engine", "ejs");

const generateRandomString = function(length = 6) {             // Generates random string for shortURL
  return Math.random().toString(20).substr(2, length);
};

const urlDatabase = {// URL Database
  b6UTxQ: { longURL: "www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "www.google.ca", userID: "aJ48lW" },
  fBioGr: { longURL: "www.google.com", userID: "123" }
};

const users = {// Users Database
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "123": {
    id: "123",
    email: "1@g",
    password: "$2b$10$JMaDpbHXrIMc.tiEidEgTu1z2p7ihzGFU2bmxTvgHD/RouLhLZX96"
  },
  "321": {
    id: "321",
    email: "22@f",
    password: "$2b$10$xjFp.kmBRqgajOrjKdLOY.H0w8wusXmsUBAA7X3G87g39nmWJs5ye"
  }
};

const urlsForUser = function(id) { // Returns object with only those URLs that belong to certain user
  let filteredURLs = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      // console.log("is not equal")
      filteredURLs[url] = urlDatabase[url];
    }
  }
  return filteredURLs;
};

app.get("/", (req, res) => {
  // res.send("Hello!");
  const id = req.session.user_id;
  if (id) {
    res.redirect('/urls');
    return
  }
  res.redirect('/login');
});

app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const filteredURLs = urlsForUser(id);// URLs that belong to current user
  const templateVars = { urls: filteredURLs, user: users[id] };
  res.render("urls_index", templateVars);
});
app.get("/register", (req, res) => {
  const id = req.session.user_id;
  const templateVars = { user: users[id] };
  res.render("register", templateVars);
});
app.get("/login", (req, res) => {
  const id = req.session.user_id;
  const templateVars = { user: users[id] };
  res.render("login", templateVars);
});
app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  const templateVars = { user: users[id] };
  if (id) {
    return res.render("urls_new", templateVars);
  }
  res.redirect('/login');
});
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const userID = urlDatabase[shortURL].userID;
  const templateVars = { shortURL, longURL, userID, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = `https://${urlDatabase[shortURL].longURL}`;
  res.redirect(longURL);
});
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  const id = req.session.user_id;
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: id};
  res.redirect(`/urls/${shortURL}`);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.user_id;
  const shortUrl = req.params.shortURL;
  if (id !== urlDatabase[shortUrl].userID) {// Checks if ID of the user who wants to delete URL equals userID who created this url
    res.status(403).send('You can\'t perform this operation');
  } else {
    delete urlDatabase[shortUrl];
    res.redirect(`/urls`);
  }
});
app.post("/urls/:id", (req, res) => {
  const id = req.session.user_id;           // Current user's ID
  const shortUrl = req.params.id;           // Short URL that user wants to edit
  if (id !== urlDatabase[shortUrl].userID) {// Checks if ID of the user who wants to edit url equals userID who created this url
    res.status(403).send('You can\'t edit URLs of other users');
  } else {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect(`/urls`);
  }
});
app.post("/login", (req, res) => {
  const email = req.body.email;
  const existUser = getUserByEmail(email, users);
  const existID = existUser.id;
  if (!existUser) {                                // Checks if email exists in users database
    res.status(403).send('Wrong user\'s email');
  }
  if (!bcrypt.compareSync(req.body.password, users[existID].password)) { // Compares passwords
    return res.status(403).send('Email and Password do not match');
  }
  req.session.user_id = existID;
  res.redirect(`/urls`);
});
app.post("/logout", (req, res) => {
  req.session = null;                    //Clears the cookies
  res.redirect("/urls");
});
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const plainTextPassword = req.body.password;
  const password = bcrypt.hashSync(plainTextPassword, 10);// Hashing the password
  
  if (email === "" || plainTextPassword === "") {                  // Checks if registration email or password fields are empty
    res.status(400).send('Email and Password fields can\'t be empty.');
  } else if (!getUserByEmail(email, users)) {             // Checks if email already exists
    users[id] = { id, email, password };
    req.session.user_id = id;
    res.redirect("/urls");
    return;
  }
  res.status(400).send('This email is already used. Choose another one.');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
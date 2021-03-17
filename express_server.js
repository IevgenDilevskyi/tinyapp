const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')
app.use(cookieParser());
app.set("view engine", "ejs");

function generateRandomString(length=6){
  return Math.random().toString(20).substr(2, length)
};

const urlDatabase = {
  "b2xVn2": "www.lighthouselabs.ca",
  "9sm5xK": "www.google.com"
};
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const lookUp = function(email, object) {
  for (let item in object) {
    console.log(object[item].email)
    if (object[item].email === email) {
      return true
    }
  }
  return false
}

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };// user: users[req.cookies.user_id] - user from the table with current cookies.user_id
  res.render("urls_index", templateVars);
});
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("register", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  const id = req.cookies.user_id;
  console.log(id);
  const test = { user: users[id] };
  console.log("test", test);
  res.render("urls_new", templateVars);
});
app.post("/urls", (req, res) => {
  console.log(req.body);
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});
app.post("/urls/:id", (req, res) => {
  console.log(req.params.id);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
});
app.post("/login", (req, res) => {
  res.cookie("username",req.body.username);
  res.redirect(`/urls`);
});
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  console.log("usersTable", users)
  if (email === "" || password === "") {// Checks if registration email or password fields are empty
    res.status(400).send('Email and Password fields can\'t be empty.')
  } else if (!lookUp(email, users)) {
    users[id] = { id, email, password };
    res.cookie("user_id", id);
    res.redirect("/urls");
  } else {
  res.status(400).send('This email is already used. Choose another one.')
  }
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = `https://${urlDatabase[req.params.shortURL]}`;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
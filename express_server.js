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

// const urlDatabase = {
//   "b2xVn2": "www.lighthouselabs.ca",
//   "9sm5xK": "www.google.com"
// };

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  fBioGr: { longURL: "https://www.google.com", userID: "123" }
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
  },
 "123": {
    id: "123", 
    email: "1@g", 
    password: "111"
  }
}

const urlsForUser = function(id) { // Returns only URLs that belong to certain user
  let filteredURLs = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      // console.log("is not equal")
      filteredURLs[url] = urlDatabase[url];
    }
  }
  return filteredURLs
}

// const filteredURLs = urlsForUser("testUser");

const lookupEmail = function(email, object) {//Checks if user with this email already exists in "users" object
  for (let item in object) {
    // console.log(object[item].email)
    if (object[item].email === email) {
      return object[item].id
    }
  }
  return false
}
// const lookupPass = function(password, object) {//Checks if user with this password already exists in "users" object
//   for (let item in object) {
//     // console.log(object[item].password)
//     if (object[item].password === password) {
//       return object[item].id
//     }
//   }
//   return false
// }

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/urls", (req, res) => {
  const filteredURLs = urlsForUser(req.cookies.user_id);
  const templateVars = { urls: filteredURLs, user: users[req.cookies.user_id] };// user: users[req.cookies.user_id] - user from the table with current cookies.user_id
  // console.log("user", templateVars.user)
  res.render("urls_index", templateVars);
});
app.get("/register", (req, res) => {
  console.log(urlDatabase)
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("register", templateVars);
});
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("login", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  const id = req.cookies.user_id;
  console.log("ID", id);
  // const test = { user: users[id] };
  if (id) {
    return res.render("urls_new", templateVars);
  }
  res.redirect('/login');
});
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies.user_id};
  // console.log("URLdatabase", urlDatabase);
  res.redirect(`/urls`);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.cookies.user_id;
  const shortUrl = req.params.shortURL;
  console.log("shortURL.userID ", urlDatabase[shortUrl].userID);
  if (id !== urlDatabase[shortUrl].userID) {// Checks if ID of the user who wants to delete url equals userID who created this url
    res.status(403).send('You can\'t delete URLs of other users');
  } else {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
  }
});
app.post("/urls/:id", (req, res) => {
  const id = req.cookies.user_id;// Current user's ID
  const shortUrl = req.params.id;// Id of user who crated URL in database
  console.log("shortURL.userID ", urlDatabase[shortUrl].userID);
  if (id !== urlDatabase[shortUrl].userID) {// Checks if ID of the user who wants to edit url equals userID who created this url
    res.status(403).send('You can\'t edit URLs of other users');
  } else {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect(`/urls`);
  }
});
app.post("/login", (req, res) => {
  if (!lookupEmail(req.body.email, users)){// Checks if email exists in users database
    res.status(403).send('User with this email doesn\'t exist in our database')
  }
  const existID = lookupEmail(req.body.email, users);
  if (users[existID].password !== req.body.password){// Checks if password mathces user's email
    res.status(403).send('Wrong password for this email')
  }
  res.cookie("user_id", existID);// If previous checks pass, set the cookie
  res.redirect(`/urls`);//and redirect
});
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {// Checks if registration email or password fields are empty
    res.status(400).send('Email and Password fields can\'t be empty.')
  } else if (!lookupEmail(email, users)) {// Checks if email already exists
    users[id] = { id, email, password };
    res.cookie("user_id", id);
    res.redirect("/urls");
  } else {
  res.status(400).send('This email is already used. Choose another one.')
  }
});
app.get("/urls/:shortURL", (req, res) => {
  const filteredURLs = urlsForUser(req.cookies.user_id);
  console.log("FILTERED for /:shortURL", filteredURLs);
  // console.log("FILTERED userID", filteredURLs[req.params.shortURL].userID);
  // console.log("userID", urlDatabase[req.params.shortURL].userID, "current user", users[req.cookies.user_id].id);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userID: urlDatabase[req.params.shortURL].userID, user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = `https://${urlDatabase[req.params.shortURL].longURL}`;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
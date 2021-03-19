const getUserByEmail = function(email, database) {//Checks if user with this email already exists in "users" database
  for (let item in database) {
    // console.log(database[item].email)
    if (database[item].email === email) {
      let user = database[item];
      return user // Returns user's ID
    }
  }
  return undefined
}

module.exports = { getUserByEmail };
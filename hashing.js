const bcrypt = require('bcrypt');
const plainTextPass = '111';

const hashedPass = bcrypt.hashSync(plainTextPass, 10);

console.log(hashedPass);

bcrypt.compare('111', hashedPass)
  .then((result) => {
    console.log('do the passwords match?', result)
  })
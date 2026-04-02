const bcrypt = require('bcrypt');
require('dotenv').config();

const hashedPassword = async () => {
const password = process.env.ADMIN_PASSWORD;

try{
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log('Hashed Password:', hashedPassword);
} catch (error) {
  console.error('Error hashing password:', error);
}
};
hashedPassword();

//$2b$10$qy7/eP7kzpTj5.RTpo0MkOJeUXU2MQOy9D6gLZ/U9xtD3PTHP64Za
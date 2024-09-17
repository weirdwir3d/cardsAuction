import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
const app = express();

import auth from './routes/auth.js';
import users from './routes/users.js';
import cards from './routes/cards.js';

app.use(express.json()) 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser()); // For parsing cookies
app.use("/auth", auth);
app.use("/users", users);
app.use("/cards", cards);

app.get('/', (req, res) => {
  // console.log(req);
  // res.send('Hello World!')
  res.json({ msg: "hello world"});
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
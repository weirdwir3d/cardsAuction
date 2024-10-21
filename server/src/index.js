import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
const app = express();

import auth from './routes/auth.js';
import users from './routes/users.js';
import cards from './routes/cards.js';
import auctions from './routes/auctions.js';
import bids from './routes/bids.js';

app.use(express.json()) 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser()); // parsing cookies
// Enable CORS for all origins
app.use(cors({
  origin: 'http://localhost:5173', // Allow any origin
  methods: 'GET,POST,PUT,DELETE', // Specify allowed HTTP methods
  credentials: true, // Allow credentials (cookies, etc.)
}));

app.use("/auth", auth);
app.use("/users", users);
app.use("/cards", cards);
app.use("/auctions", auctions);
app.use("/bids", bids);

app.get('/', (req, res) => {
  // console.log(req);
  // res.send('Hello World!')
  res.json({ msg: "hello world"});
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
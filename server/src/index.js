import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import auth from './routes/auth.js';
import users from './routes/users.js';
import cards from './routes/cards.js';
import auctions from './routes/auctions.js';
import bids from './routes/bids.js';

const FRONTEND_PORT = process.env.FRONTEND_PORT || 4173;
const app = express();

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser()); // parsing cookies?
//CORS for all origins
// https://expressjs.com/en/resources/middleware/cors.html
app.use(cors({
  origin: `http://localhost:${FRONTEND_PORT}`,
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
}));

app.use("/auth", auth);
app.use("/users", users);
app.use("/cards", cards);
app.use("/auctions", auctions);
app.use("/bids", bids);

app.get('/', (req, res) => {
  res.json({ msg: "hello world" });
})

const PORT = process.env.PORT || 3000;
app.listen(PORT);
import cors from 'cors';
import express from 'express';
import { StatusCodes } from 'http-status-codes';

import connectDB from './config/dbConfig.js';
import { CLIENT_URL } from './config/serverConfig.js';
import { PORT } from './config/serverConfig.js';
import redis from './libs/redisConfig.js';
import apiRouter from './routes/apiRoutes.js';

const app = express();


/** ---------- Enable CORS ---------- */
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type','x-access-token', 'Authorization'],
  credentials: true,
}));

/**------------Allow json and urlencoded data-------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



/** ---------- Health & base routes ---------- */
app.get('/', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'Hello, World!' });
});

app.use('/api', apiRouter);


/** ---------- Startup (fail fast) ---------- */
const start = async()=>{
  try {
    await connectDB();
    await redis.ping();
    console.log('Connected to Redis');
    app.listen(PORT, ()=>{
      console.log(`Server is listening on port ${PORT}`);
    })
  } catch (error) {
    console.log('Startup failed: ', error);
    process.exit(1);
  }
};

start();


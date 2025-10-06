import mongoose from 'mongoose';

import { NODE_ENV } from '../config/serverConfig.js';
import { DEV_DB_URL, PROD_DB_URL } from '../config/serverConfig.js';
const DB_Name = 'QuickGpt';

export default async function connectDB() {
  try {
    let conn;
    if (NODE_ENV === 'development') {
      conn = await mongoose.connect(`${DEV_DB_URL}/${DB_Name}`);
    } else if (NODE_ENV === 'production') {
      conn = await mongoose.connect(PROD_DB_URL);
    }
    console.log(`Connected to database host: ${conn.connection.host} from ${NODE_ENV} environment`);
  } catch (error) {
    console.log('Error connecting to database', error);
  }
}

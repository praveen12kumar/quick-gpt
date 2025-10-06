import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000

export const NODE_ENV = process.env.NODE_ENV || 'development'
export const DEV_DB_URL = process.env.DEV_DB_URL
export const PROD_DB_URL = process.env.PROD_DB_URL

export const CLIENT_URL = process.env.CLIENT_URL

export const JWT_SECRET = process.env.JWT_SECRET
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN

export const REDIS_URL = process.env.REDIS_URL

export const MAIL_ID = process.env.MAIL_ID;
export const MAIL_PASSWORD = process.env.MAIL_PASSWORD;

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;
export const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
export const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;


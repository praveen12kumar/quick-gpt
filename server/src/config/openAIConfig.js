import OpenAI from "openai";

//import { GEMINI_API_KEY } from "./serverConfig.js";

// const openai = new OpenAI({
//   apiKey: GEMINI_API_KEY,
//   baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
// });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default openai;



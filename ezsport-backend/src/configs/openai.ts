import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1', // Sử dụng Groq API
});
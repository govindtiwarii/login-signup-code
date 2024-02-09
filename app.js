import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDb from './config/connectdb.js';
import userroutes from './routes/userroutes.js';

const port = 8000; // Manually set port for testing
// console.log('PORT:', port);


const app = express()
app.use(express.json())

app.use('/api/user', userroutes)


const DATABASE_URL = process.env.DATABASE_URL

app.use(cors());
connectDb(DATABASE_URL)

app.listen(port,() => {
    console.log(`server is listening at http://localhost:${port}`);
});
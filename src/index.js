// require('dotenv').config({path:'./env'}) - commonjs

import dotenv from 'dotenv'
import connectDB from "./db/db.js";

dotenv.config({
    path:'./env'
})
connectDB();
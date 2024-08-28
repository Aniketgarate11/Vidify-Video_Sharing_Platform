import mongoose from "mongoose";


const connectDB = async ()=>{
    await mongoose.connect()
}


export default connectDB
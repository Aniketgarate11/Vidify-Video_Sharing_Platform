import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        // console.log(connectionInstance);
        
        console.log(`\n Mongo DB Connected !! DB Host: ${connectionInstance.mongoose.connections[0].host }`);
        
    } catch (error) {
        console.log("MONGOBD CONNECTION ERROR :  ", error);
        process.exit(1)
    }
         
}


export default connectDB
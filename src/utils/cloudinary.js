
import {v2 as cloudinary} from "cloudinary"
import fs from 'fs'


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upoloadOnCloudinary = async (localFilePath)=>{

    try {
        //check if filepath is exists
        if(!localFilePath) return null

        // upload an image
        const response = await cloudinary.uploader.upload(localFilePath, {resource_type:"auto"} )

        // console.log('File has been uploaded succesfully', response.url);

        fs.unlinkSync(localFilePath) // removing files from the local DB after upload succesfully
        return response;
    } catch (error) {
        
        //  removing the locally saved temporary file as operation got failed
        fs.unlinkSync(localFilePath)  
        return null
        
    }
}

export {upoloadOnCloudinary}
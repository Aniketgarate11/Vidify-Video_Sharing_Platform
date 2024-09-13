//Middleware to aurhenticate the user 

import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// when res/req is not in use then '_' can be used
export const verifyJWT = asyncHandler(async (req, _, next) => {

    try {
        const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token){
            throw new ApiError(401, "Unauthorized request")
        }

       const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

       const user = await User.findById(decodedToken?._id).select("-refreshtoken -password");

       if(!user){
        throw new ApiError(404, "Invalid access Token")
       }

       req.user = user ;
       next()
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid access token")
    }
})
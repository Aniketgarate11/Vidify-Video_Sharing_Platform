import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { upoloadOnCloudinary } from "../utils/cloudinary.js";
import { ApiSuccess } from "../utils/ApiSuccess.js";
import jwt from "jsonwebtoken"
import { json } from "express";


//function to generate access and refresh Token When user logged in
const generateAccessTokenAndRefreshToken = async (userId)=>{
    try {
        const user = await User.findById(userId)  
        // console.log(user);
         
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({validateBeforeSave:false});

        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, " Something went wrong while generating access and refresh token")
    }
}

//route handeler for regester User
const regesterUser = asyncHandler(async (req, res) => {
    // res.status(200).json({ message: "user registered" })

    //getting user detail from front-end
    const { username, email, fullname, password } = req.body;

    //validation- check the fields are not empty
    if ([username, email, fullname, password].some((field) => field?.trim() === "")) {

        throw new ApiError(400, "All fields are required")
    }

    //check user alredy exist in BD with same email or username
    const existedUser = await User.findOne(
        {
            $or: [{ username }, { email }]
        })

    if (existedUser) {
        throw new ApiError(409, 'User with username or email alredy exists')
    }

    //checking for files (cover and avatar)
    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(avatarLocalPath);
    

    // const coverimageLocalPath = req.files?.coverimage[0]?.path;      // will return undefine

    let coverimageLocalPath;
    if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0){
        coverimageLocalPath = req.files.coverimage[0].path;
    }

    //check avater is is there
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }


    //upload on DB(Cloudinary) store in variable to ckeck
    const avatar = await upoloadOnCloudinary(avatarLocalPath);
    const coverimage = await upoloadOnCloudinary(coverimageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    // creating user in DB  add data

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverimage: coverimage?.url || "",
        email,
        password,
        username : username.toLowerCase(),
    });

    //remove the password and ref-token from res

    const createdUser = await User.findById(user._id).select("-password -refreshtoken");

    //ckeck created user in DB

    if(!createdUser){
        throw new ApiError(500,"something went wromg while register the User")
    }

    return res.status(201).json(new ApiSuccess(200,createdUser,"User registered successfully"))
})

//route handeler for Log-In User
const loginUser = asyncHandler( async ( req, res ) =>{
    
    //takng data from user
    const {email , username , password} = req.body;

    // console.log(email, password);
    // console.log(typeof(password));

    
    
    

    //getting data from DB
    const user = await User.findOne({$or: [{email},{username}]})

//     console.log(user);
//    console.log(typeof(user.password));
//    console.log(user.password);
   
    

    
    

    if(!user){
        throw new ApiError(404, "User does not exists")
    }

   const isPasswordCorrect =  await user.isPasswordCorrect(password);

//    console.log(isPasswordCorrect);
   

   if(!isPasswordCorrect){
    throw new ApiError(401, "Invalide user Credentials")
   }
   
   

   // generate and access - ref and Access token
  const {accessToken, refreshToken} =await generateAccessTokenAndRefreshToken(user._id);

  // get User from db with fresh refresh Token
  const loggedInUser = await User.findById(user._id).select("-refreshtoken -password")

  //setting cookies i.e tokens

  const options = {
    httpOnly : true,
    secure : true
  }

  return res.status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiSuccess(
        200,
        {
            user : loggedInUser, accessToken, refreshToken
        },

        "User logged In successfully"
    )
  )

})

//route handeler for Log-out User
const logoutUser = asyncHandler( async (req, res)=>{
    // console.log(req.user);
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {refreshtoken:undefined}
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiSuccess(200,{},"User logged Out"))
})

const refreshAccessToken = asyncHandler( async (req, res)=>{

    const incomingRefreshToken = req.cookies.refreshAccessToken || req.body.refreshAccessToken;

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

   try {
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
 
    const user = User.findById(decodedToken?._id)
 
    if(!user){
     throw new ApiError(401,'Invalide refresh token')
    }
 
    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, 'Refresh token is expired or used')
    }
     
   const {newRefreshToken, accessToken} =  await generateAccessTokenAndRefreshToken(user._id);
 
   options ={
     httpOnly : true,
     secure : true
   }
 
   return res
   .status(200)
   .cookie("accessToken", accessToken ,options)
   .cookie("refreshToken", newRefreshToken , options)
   .json(new ApiSuccess(
     200,
     {accessToken , refreshToken : newRefreshToken},
     "access token refreshed"
   ))
   } catch (error) {
       throw new ApiError(401, error?.message || "Unauthorized request")
   }
})


export { regesterUser, loginUser, logoutUser, refreshAccessToken}
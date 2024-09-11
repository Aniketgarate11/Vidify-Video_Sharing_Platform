import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { upoloadOnCloudinary } from "../utils/cloudinary.js";
import { ApiSuccess } from "../utils/ApiSuccess.js";

const generateAccessTokenAndRefreshToken = async (userId)=>{
    try {
        const user = await User.findById(userId)   
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({validateBeforeSave:false});

        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, " Something went wrong while generating access and refresh token")
    }
}

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


const loginUser = asyncHandler( async ( req, res ) =>{
    
    //takng data from user
    const {email , username , password} = req.body;

    //getting data from DB
    const user = await User.findOne({$or: [{email},{username}]})

    if(!user){
        throw new ApiError(404, "User does not exists")
    }

   const isPasswordCorrect =  await user.isPasswordCorrect(password);

   if(!isPasswordCorrect){
    throw new ApiError(401, "Invalide user Credentials")
   }

})


export { regesterUser }
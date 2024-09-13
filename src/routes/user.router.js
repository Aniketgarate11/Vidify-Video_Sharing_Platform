
import { Router } from "express";
import { regesterUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.Middleware.js"


const router = Router()

router.route("/register").post(
    upload.fields(
        [{
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverimage",
            maxCount: 1
        }]
    ),
    regesterUser
)


router.route("/login",).post(loginUser);

//secured routes 
router.route("/logout").post(verifyJWT, logoutUser)



export default router;
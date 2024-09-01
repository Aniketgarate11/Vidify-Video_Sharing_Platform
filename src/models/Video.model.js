import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = mongoose.Schema(
    {
        videofile: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
            required: true
        },
        contentcreater: {    //contentcreater is owner
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number
        },
        views: {
            // type: mongoose.Schema.Types.ObjectId,
            // ref: "User",
            type : Number,
            default: 0
        },
        ispublished: {
            type: Boolean,
            default: true
        }

    },
    { timestamps: true }
)

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema)
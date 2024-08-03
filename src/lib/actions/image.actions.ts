"use server";

import { revalidatePath } from "next/cache";
import { handleError } from "../utils";
import { connectToDatabase } from "../database/mongoose";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";
//in populate user we are also addding clerkId so that we can sshow update button for user who has created that image
const populateUser = (query: any) =>
	query.populate({
		path: "author",
		model: User,
		select: "_id firstName lastName clerkId ",
	});

//Add Image
export async function addImage({ image, userId, path }: AddImageParams) {
	try {
		await connectToDatabase();
		//get user from User db
		const author = await User.findById(userId);
		if (!author) {
			throw new Error("Author  not found");
		}
		const newImage = await Image.create({
			...image,
			author: author._id,
		});
		revalidatePath(path);
		return JSON.parse(JSON.stringify(newImage));
	} catch (error) {
		handleError(error);
	}
}
//Update Image
export async function updateImage({ image, userId, path }: UpdateImageParams) {
	try {
		await connectToDatabase();
		const imageToUpdate = await Image.findById(image._id);
		if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
			throw new Error("Image not found or no access to image ");
		}
		const updatedImage = await Image.findByIdAndUpdate(
			imageToUpdate._id,
			image,
			{ new: true }
		);

		revalidatePath(path);
		return JSON.parse(JSON.stringify(updatedImage));
	} catch (error) {
		handleError(error);
	}
}
//Delete Image
export async function deleteImage(imageId: string) {
	try {
		await connectToDatabase();
		const image = await Image.findByIdAndDelete(imageId);
	} catch (error) {
		handleError(error);
	} finally {
		redirect("/");
	}
}
//GET Image
export async function getImageById(imageId: string) {
	try {
		await connectToDatabase();
		const image = await populateUser(Image.findById(imageId));
		if (!image) {
			throw new Error("Image not  found");
		}
		return JSON.parse(JSON.stringify(image));
	} catch (error) {
		handleError(error);
	}
}
//GET ALL IMAGES
export async function getAllImages({
	limit = 9,
	page = 1,
	searchQuery = "",
}: {
	limit?: number;
	page: number;
	searchQuery?: string;
}) {
	try {
		await connectToDatabase();
        //configuring cloudinary 
		cloudinary.config({
			cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key:process.env.CLOUDINARY_API_KEY,
            api_secret:process.env.CLOUDINARY_API_SECRET,
            secure:true
		});
        //initial expression (its folder where we will search for images and get images from their)
        let expression ="folder=retouchlab"
        //searching for specific images  based on query that user has entered
        if(searchQuery)
        {
            expression+=`AND ${searchQuery}`
        }
        //getting all the resources basedon the exression
        const {resources}=await cloudinary.search.expression(searchQuery).execute();
        //after getting all the resources we will get their id . so that we can get that from our database
        const resourceIds= resources.map((resource:any)=>resource.public_id)

        //querying our own database
        let query={}
        if(searchQuery)
        {
            query={
                publicId:{
                    $in:resourceIds
                }

            }
        }
        const skipAmount=(Number(page)-1)*limit;
        //getting all the matched images from our db
        const images=await populateUser(Image.find(query)).sort({updatedAt:-1}).skip(skipAmount).limit(limit)
        // get image count of images which matches our searched query
        const totalImages= await Image.find(query).countDocuments();
        //  counbt of all images store in our db
        const  savedImage=await Image.find().countDocuments();
        return {
            data:JSON.parse(JSON.stringify(images)) ,
            savedImage ,
            toalPage:Math.ceil(totalImages/limit)

        }
	} catch (error) {
		handleError(error);
	}
}


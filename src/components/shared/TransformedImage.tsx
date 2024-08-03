"use client"
import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { CldImage, getCldImageUrl } from "next-cloudinary";
import { dataUrl, debounce, download, getImageSize } from "@/lib/utils";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";

const TransformedImage = ({
	image,
	type,
	isTransforming,
	setIsTransforming,
	transformationConfig,
	title,
	hasDownload = false,
}: TransformedImageProps) => {
	const downloadHandler = (e:React.MouseEvent<HTMLButtonElement , MouseEvent>) => {
		e.preventDefault();
		download(getCldImageUrl({
			width:image?.width ,
			height:image?.height,
			src:image?.publicId,
			...transformationConfig

		}),title)
	};
	return (
		<div className="flex flex-col gap-4">
			<div className=" flex-between">
				<h3 className="text-dark-600 h3-bold">Transformed 🪄</h3>
				{hasDownload && (
					<button className="download-btn" onClick={downloadHandler}>
						<Image
							src="/assets/icons/download.svg"
							alt="download"
							height={24}
							width={24}
							className="pb-[6px]"
						/>
					</button>
				)}
			</div>
			{/* //if we get the transformed image then render it or else render the
			skeleton of transformed image */}
			{image?.publicId && transformationConfig ? (
				<div className="relative">
					<CldImage
						width={getImageSize(type, image, "width")}
						height={getImageSize(type, image, "height")}
						src={image?.publicId}
						alt={image?.title}
						sizes={"(max-width:767px) 100vw , 50vw"}
						placeholder={dataUrl as PlaceholderValue}
						className="transformed-image"
						// when image is loaded then set istransforming to false
						onLoad={() => {
							setIsTransforming && setIsTransforming(false);
						}}
						// when any error  occur then we will wait for 8sec and  will again set it to false
						onError={() => {
							debounce(() => {
								setIsTransforming && setIsTransforming(false);
							}, 8000)();
						}}
						//spreading transformationconfig  to get all the transformation that we have applied on image
						{...transformationConfig}
					/>
					{isTransforming && (
						<div className="transforming-loader">
							<Image
								src="assets/icons/loader.svg"
								alt="loader"
								height={50}
								width={50}
							/>
							<p className="text-white ">Please wait ...</p>
						</div>
					)}
				</div>
			) : (
				<div className="transformed-placeholder">Transformed image</div>
			)}
		</div>
	);
};

export default TransformedImage;

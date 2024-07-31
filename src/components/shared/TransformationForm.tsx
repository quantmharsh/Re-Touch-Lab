"use client";

import { z } from "zod";

export const formSchema = z.object({
	title: z.string().min(3, {
		message: "Title must be at least 3 characters",
	}),
	aspectRatio: z.string().optional(),
	color: z.string().optional(),
	prompt: z.string().optional(),
	publicId: z.string().optional(),
});
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React, { useState, useTransition } from "react";
import {
	aspectRatioOptions,
	creditFee,
	defaultValues,
	transformationTypes,
} from "../../../constants";
import { CustomField } from "./CustomField";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils";
import { updateCredits } from "@/lib/actions/user.actions";
import MediaUploader from "./MediaUploader";
import TransformedImage from "./TransformedImage";

const TransformationForm = ({
	action,
	data = null,
	userId,
	type,
	creditBalance,
	config = null,
}: TransformationFormProps) => {
	const transformationType = transformationTypes[type];
	//for uploading images
	const [image, setImage] = useState(data);
	//image after transformation
	const [newTransformation, setNewTransformation] =
		useState<Transformations | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isTransforming, setIsTransforming] = useState(false);
	const [transformationConfig, setTransformationConfig] = useState(config);
	//use Transition hook  (it helps to update the state without blocking the UI)
	const [isPending, startTransition] = useTransition();

	//Defining intiial values of our form
	const initialValues =
		data && action === "Update"
			? {
					title: data?.title,
					aspectRatio: data?.aspectRatio,
					color: data?.color,
					prompt: data?.prompt,
					publicId: data?.publicId,
			  }
			: defaultValues;
	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: initialValues,
	});

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		console.log(values);
	}
	//Select  field handler
	const onSelectFieldHandler = (
		value: string,
		onChangeField: (value: string) => void
	) => {
		//get the image size thay we have selected
		const imageSize = aspectRatioOptions[value as AspectRatioKey];
		setImage((prevState: any) => ({
			...prevState,
			aspectRatio: imageSize.aspectRatio,
			width: imageSize.width,
			height: imageSize.height,
		}));
		setNewTransformation(transformationType.config);
		return onChangeField(value);
	};
	const onInputChangeHandler = (
		value: string,
		type: string,
		fieldName: string,
		onChangeField: (value: string) => void
	) => {
		debounce(() => {
			setNewTransformation((prevState: any) => ({
				...prevState,
				[type]: {
					...prevState?.[type],
					[fieldName === "prompt" ? "prompt" : "to"]: value,
				},
			}));
		}, 1000);
		return onChangeField(value);
	};
	const onTransformHandler = async () => {
		setIsTransforming(true);
		setTransformationConfig(
			//Merges key of both object to create new object
			deepMergeObjects(newTransformation, transformationConfig)
		);
		setNewTransformation(null);
		startTransition(async () => {
			await updateCredits(userId, creditFee);
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<CustomField
					control={form.control}
					name="title"
					formLabel="Image Title"
					className="w-full"
					render={({ field }) => <Input {...field} className="input-field " />}
				/>
				{type === "fill" && (
					<CustomField
						render={({ field }) => (
							<Select
								onValueChange={(value) =>
									onSelectFieldHandler(value, field.onChange)
								}>
								<SelectTrigger className="select-field">
									<SelectValue placeholder="Select size" />
								</SelectTrigger>
								<SelectContent>
									{Object.keys(aspectRatioOptions).map((key) => (
										<SelectItem key={key} value={key} className="select-item">
											{aspectRatioOptions[key as AspectRatioKey].label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
						control={form.control}
						name="aspectRatio"
						formLabel="Aspect Ratio"
						className="w-full"
					/>
				)}
				{(type === "remove" || type === "recolor") && (
					<div>
						<CustomField
							control={form.control}
							name="prompt"
							formLabel={
								type === "recolor" ? "Object to recolor" : "Object to remove"
							}
							className="w-full"
							render={({ field }) => (
								<Input
									value={field.value}
									className="input-field"
									onChange={(e) =>
										onInputChangeHandler(
											"prompt",
											e.target.value,
											type,
											field.onChange
										)
									}
								/>
							)}
						/>
						{type === "recolor" && (
							<CustomField
								control={form.control}
								name="color"
								formLabel="Replacement Color"
								className="w-full"
								render={({ field }) => (
									<Input
										value={field.value}
										className="input-field"
										onChange={(e) =>
											onInputChangeHandler(
												"color",
												e.target.value,
												"recolor",
												field.onChange
											)
										}
									/>
								)}
							/>
						)}
					</div>
				)}
				<div className="media-uploader-field">
					<CustomField
						control={form.control}
						name="publicId"
						className="flex size-full flex-col"
						render={({ field }) => (
							<MediaUploader
								onValueChange={field.onChange}
								setImage={setImage}
								publicId={field.value}
								image={image}
								type={type}
							/>
						)}
					/>
					<TransformedImage 
					image={image}
					isTransforming={isTransforming}
					setIsTransforming={setIsTransforming}
					type={type}
					title={form.getValues().title}
					transformationConfig={transformationConfig}

					/>
				</div>
				<div className=" flex flex-col gap-4">
					<Button
						type="button"
						className="submit-button capitalize"
						disabled={isTransforming || newTransformation === null}
						onClick={onTransformHandler}>
						{isTransforming ? "Transforming..." : "Apply Transformation"}{" "}
					</Button>
					<Button
						type="submit"
						className="submit-button capitalize"
						disabled={isSubmitting}>
						{" "}
						{isSubmitting ? "Saving image..." : "Save Image "}
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default TransformationForm;

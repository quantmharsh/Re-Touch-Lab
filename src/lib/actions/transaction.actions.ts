"use server";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { handleError } from "../utils";
import { connectToDatabase } from "../database/mongoose";
import Transaction from "../database/models/transaction.model";
import { updateCredits } from "./user.actions";
export async function checkOutCredits(transaction: CheckoutTransactionParams) {
	//creating the stripe instance
	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
	//amount that we will deduct
	const amount = Number(transaction.amount) * 100;
	console.log("Inside checkout credits")
	const session = await stripe.checkout.sessions.create({
		line_items: [
			{
				price_data: {
					currency: "inr",
					unit_amount: amount,
					product_data: {
						name: transaction.plan,
					},
				},
				quantity: 1,
			},
		],
		// what we are returning
		metadata: {
			plan: transaction.plan,
			credits: transaction.credits,
			buyerId: transaction.buyerId,
		},
		mode: "payment",
		success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
		cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`,
	});
	console.log("redirecting to session.url" ,session.url)
	redirect(session.url!);
}
//save transaction to our db
export async function createTransaction(transaction: CreateTransactionParams) {
	try {
		await connectToDatabase();
		// spreading transaction because in db we have field named buyer but here we have buyerId\
		// creating new transaction
		console.log("inside createTransaction method ")
		const newTransaction = await Transaction.create({
			...transaction,
			buyer: transaction.buyerId,
		});
		//updating credits field in user
		console.log("got new transaction " , newTransaction)
		console.log("going to update credits")
		await updateCredits(transaction.buyerId, transaction.credits);
		console.log("credits updated ")
		return JSON.parse(JSON.stringify(newTransaction));
	} catch (error) {
		handleError(error);
	}
}

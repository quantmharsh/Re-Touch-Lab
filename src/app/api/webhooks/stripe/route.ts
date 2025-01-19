/* eslint-disable camelcase */

import { createTransaction } from "@/lib/actions/transaction.actions";
import { notifyEvent } from "@/lib/ping-panda-integration/eventNotifier";
import { NextResponse } from "next/server";
import stripe from "stripe";
//creating a transaction and storing it in our db when this event is initiatd 
export async function POST(request: Request) {
  const body = await request.text();

  const sig = request.headers.get("stripe-signature") as string;
  const endpointSecret = process.env.STRIPE_SIGNING_SECRET_KEY!;

  let event;
   console.log("body " , body) ;
   console.log("sig", sig);
   console.log("endpointSecret", endpointSecret);
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    console.log("Event constructed successfully");
  } catch (err) {
    return NextResponse.json({ message: "Webhook error", error: err });
  }

  // Get the ID and type
  const eventType = event.type;
  console.log("event type " );

  // CREATE
  if (eventType === "checkout.session.completed") {
    const { id, amount_total, metadata } = event.data.object;
    console.log(id , amount_total , metadata);

    const transaction = {
      stripeId: id,
      amount: amount_total ? amount_total / 100 : 0,
      plan: metadata?.plan || "",
      credits: Number(metadata?.credits) || 0,
      buyerId: metadata?.buyerId || "",
      createdAt: new Date(),
    };
    
    const newTransaction = await createTransaction(transaction);
    console.log("returning after creating  newTransaction inside stripe roiute.ts"  , newTransaction)
    //Notify  via Custom Event handler
    try {
       await notifyEvent({
         category:"retouchlab",
         fields:{
          userId:transaction.buyerId, 
          plan:transaction.plan,
          amount:transaction.amount
          
         }
       })
       console.log("Transaction  and notification processed successfully");
       return NextResponse.json({
        message:"Transaction and  notification processed successfully"

       })
    } catch (error) {
      console.error("Error processing transaction or notifying event:", error);
      // return NextResponse.json({ message: "Error while sending notifications", error });
      
    }
    console.log("Transaction object " , transaction);
    console.log("going to create new transaction in stripe route.ts")

    
    return NextResponse.json({ message: "OK", transaction: newTransaction });
  }

  return new Response("", { status: 200 });
}
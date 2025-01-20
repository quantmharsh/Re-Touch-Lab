

const API_URL="https://pingpandav1.vercel.app/api/v1/events";
const API_KEY=process.env.PINGPANDA_API_KEY!;

interface NotifyEventPayload{
    category:string;
    fields:Record<string , any>;

}

export async function notifyEvent(payload:NotifyEventPayload):Promise<void>{
     console.log('Notify Event' , payload);
    try {
        console.log("inside notifyEvent ")
       
        const response=await fetch(API_URL , {
            method:"POST",
            headers:{
                "Authorization":`Bearer ${API_KEY}`,
                'Content-Type':'application/json',
            },
            body:JSON.stringify(payload),
        });
        if(!response.ok)
        {
            console.log(`Failed to notify event : ${response.statusText}`);
            throw new Error(`Failed to notify event : ${response.statusText}`);
        } 
        console.log(`Event notified  successfully ${payload.category}`);

    } catch (error) {
          console.error("Error notifying event", error);
    }
    // console.log("Event notified  successfully");

}
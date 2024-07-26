
import mongoose , {Mongoose} from 'mongoose'
const MONGODB_URL=process.env.MONGODB_URL

interface MongooseConnection{
    conn:Mongoose|null;
    promise:Promise<Mongoose>|null;
}

//Since next js is  serverless unlike in react where we connect only 1s in our app.
//Here we have to  connect for every API call.
//so  we have to do connection on every pages .To Overcome this issue we come up with optimization technique
//with the help of caching mechnanism

let cached:MongooseConnection=(global as any).mongoose
if(!cached)
{
   cached =(global as any).mongoose={
    conn:null  , promise:null
   }
}
export const connectToDatabase=async()=>{
    if(cached.conn)
    {
        return cached.conn
    }
    if(!MONGODB_URL)
    {
        throw new Error("Missing mongodb uri");
    }
    cached.promise=cached.promise ||mongoose.connect(MONGODB_URL ,{
        dbName:"RETOUCHLAB" , bufferCommands:false
    })
    cached.conn=await cached.promise;
    return cached.conn;
}
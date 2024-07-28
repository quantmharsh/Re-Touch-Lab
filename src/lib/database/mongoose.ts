
import mongoose , {Mongoose} from 'mongoose'
const MONGODB_URL=process.env.MONGODB_URL
// Attach event handlers to monitor connection status
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to the database');
  });
  
  mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
  });
  
  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from the database');
  });
  
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
        console.log("Returning cached.conn" , cached.conn)
        return cached.conn
    }
    if(!MONGODB_URL)
    {
      console.log("MONGODN URL not found")
        throw new Error("Missing mongodb uri");
    } 
    console.log("Before cached.promise");
    cached.promise=cached.promise || mongoose.connect(MONGODB_URL ,{
        dbName:" NEWRETOUCHLAB" , bufferCommands:false
        
    })
    console.log("waiting for promise to return")
    cached.conn=await cached.promise;
    console.log("Connected to database" , cached.conn);
    return cached.conn;
}
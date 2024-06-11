const mongoose = require('mongoose')
const connectDB = async()=>{
    try{
        mongoose.set('strictQuery',false);
        const connected = await mongoose.connect(process.env.DATABASE_URL);
        console.log(`Database connected: ${connected.connection.host}`)
    }catch(error){
        console.log(error);
    }
}
module.exports = connectDB;
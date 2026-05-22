import mongoose from "mongoose";
import dns from "dns";

export const connectDB = async (req, res) => {
    dns.setServers(['8.8.8.8', '0.0.0.0']);
    await mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
}
import {PrismaClient} from "@prisma/client";

const prisma= new PrismaClient();

const connectDatabase= async ()=>{
    try{
        await prisma.$connect();
        console.log("Database connected successfully");
    }
    catch(error){
        console.error("Failed to connect to database:", error);
        process.exit(1);
    }
}

connectDatabase();

export default prisma;
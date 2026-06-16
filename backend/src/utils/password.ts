import bcrypt from "bcrypt";


export const hashPassword= async(password:string): Promise<string> =>{
    try{
        const hashed_pw= bcrypt.hash(password,10);
        return hashed_pw;
    }
    catch(error){
        console.error("Failed to hash password:", error);
        throw new Error("Password hashing failed");
    }

};


export const verufyPassword= async(password:string,hashed_pw:string): Promise<boolean>=>{
    try{
        return await bcrypt.compare(password,hashed_pw);

    }
    catch(error){
        console.error("Failed to verify password:", error);
        throw new Error("Password verification failed");
    }

};
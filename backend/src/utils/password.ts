import bcrypt from "bcrypt";


export const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return "Password must contain at least one special character (!@#$%^&*...)";
  }
  return null; 
};


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


export const verifyPassword= async(password:string,hashed_pw:string): Promise<boolean>=>{
    try{
        return await bcrypt.compare(password,hashed_pw);

    }
    catch(error){
        console.error("Failed to verify password:", error);
        throw new Error("Password verification failed");
    }

};
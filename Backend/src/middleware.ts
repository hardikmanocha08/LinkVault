import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config.js";
const JWT_PASSWORDS=JWT_PASSWORD;

export const userMiddleware=(req:Request,res:Response,next:NextFunction)=>{
    const header=req.headers["authorization"];
    const userid=jwt.verify(header as string,JWT_PASSWORDS);
    if(userid){
       
        //@ts-ignore
        req.id=userid.id;
        next()
    }
    else{
        res.json({
            msg:"Invalid credentials"
        })
    }
}
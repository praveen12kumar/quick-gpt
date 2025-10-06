import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { JWT_EXPIRES_IN,JWT_SECRET } from '../../config/serverConfig.js';
import redis from '../../libs/redisConfig.js';
import ClientError from '../errors/clientError.js';

export const createJWT = (payload)=>{
    return jwt.sign(payload, JWT_SECRET,{expiresIn: JWT_EXPIRES_IN} )
}

export const verifyOtp = async(email, otp)=>{
    const storedOtp = await redis.get(`otp:${email}`);
    if(!storedOtp){
        throw new ClientError({
            message: "Invalid OTP",
            statusCode: StatusCodes.NOT_FOUND,
            explanation: ["Invalid data sent from the client"],
        });
    }

    const failedAttemptsKey = `otp_attempts:${email}`;
    const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || 0);

    if(storedOtp != otp){
        if(failedAttempts > 2){
            await redis.set(`otp_lock:${email}`, "locked", "EX", 60*3);
            await redis.del(`otp:${email}`, failedAttemptsKey);
            throw new ClientError({
                message: "Too many attempts, please wait 30 minutes before trying again.",
                statusCode: StatusCodes.TOO_MANY_REQUESTS,
                explanation: ["Invalid data sent from the client"],
            });
        }
        await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 60*5);
        throw new ClientError({
            message: `Incorrect OTP. ${3 - failedAttempts} attempts left.`,
            statusCode: StatusCodes.UNAUTHORIZED,
            explanation: ["Invalid data sent from the client"],
        });
    }

    await redis.del(`otp:${email}`, failedAttemptsKey);
    return true;
}


export const hashedPassword = async(password)=>{
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}
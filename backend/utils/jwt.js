import jwt from 'jsonwebtoken'
import '@dotenvx/dotenvx/config';
import crypto from 'node:crypto';

export const generateRefreshTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: `${process.env.JWT_NUMBER_OF_DAYS_EXPIRATION}d`
    })

    if (process.env.ENVIRONMENT === 'local') {
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: process.env.COOKIE_EXPIRATION_TIME_IN_HOURS * 3600000,
        })
    } else {
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.ENVIRONMENT === 'production', // Comment this line if you only plan to use it locally.
            sameSite: "strict",
            maxAge: process.env.COOKIE_EXPIRATION_TIME_IN_HOURS * 3600000,
        })
    }

    // Potential DEV cookie below, just want to save it here.
    // res.cookie("token", token, {
    //     httpOnly: true,
    //     // secure: true,
    //     // sameSite: "none",
    //     maxAge: process.env.COOKIE_EXPIRATION_TIME_IN_HOURS * 3600000,
    // })
    
    return token;
}

export const createAccessToken = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: `${process.env.ACCESS_TOKEN_NUMBER_OF_MINUTES_EXPIRATION}m`
    })

    return accessToken;
}

export const verifyAccessToken = (token) => {
    const valid = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return valid;
}

// You can use these functions below to create the JWT_SECRET string.
// Reference OWASP - https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#secure-random-number-generation
export const create256BitLongString = () => {
    const valid256BitString = crypto.randomBytes(256).toString('hex');
    return valid256BitString;
}

export const create512BitLongString = () => {
    const valid512BitString = crypto.randomBytes(512).toString('hex');
    return valid512BitString;
}
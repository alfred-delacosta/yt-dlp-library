import jwt from 'jsonwebtoken'
import '@dotenvx/dotenvx/config';
import crypto from 'node:crypto';

export const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: `${process.env.JWT_NUMBER_OF_DAYS_EXPIRATION}d`
    })

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.ENVIRONMENT === 'production',
        sameSite: "strict",
        maxAge: process.env.COOKIE_EXPIRATION_TIME_IN_HOURS * 3600000,
    })
    
    return token;
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
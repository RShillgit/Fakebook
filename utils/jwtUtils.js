require('dotenv').config();
const jsonwebtoken = require('jsonwebtoken');

function issueJWT(user) {
    const _id = user._id;

    const expiresIn = '1d';

    const payload = {
        sub: _id,
        iat: Date.now()
    };

    const signedToken = jsonwebtoken.sign(payload, process.env.jwt_secret, {expiresIn: expiresIn}) 
    
    return {
        token: `Bearer ${signedToken}`,
        expires: expiresIn
    }
}

function jwtVerify(token) {
    const splitToken = token.split(' ')
    const jwtToken = splitToken[1];

    const decodedToken = jsonwebtoken.verify(jwtToken, process.env.jwt_secret); // Throws error if token is invalid
    return decodedToken;
}

module.exports = {
    issueJWT,
    jwtVerify
}
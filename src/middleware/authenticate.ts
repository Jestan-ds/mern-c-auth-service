import { expressjwt, GetVerificationKey } from 'express-jwt';
import jwksClient from 'jwks-rsa';
import { Config } from '../config';
import { Request } from 'express';
import { AuthCookie } from '../types';

export default expressjwt({
  secret: jwksClient.expressJwtSecret({
    jwksUri: Config.JWKS_URI!,
    cache: true,
    rateLimit: true,
  }) as unknown as GetVerificationKey,
  algorithms: ['RS256'],
  getToken(req: Request) {
    const authHeader = req.headers.authorization;
    //Bearer sdhghs(our token) usually header comes like this
    if (authHeader && authHeader.split(' ')[1] != 'undefined') {
      const token = authHeader.split(' ')[1];
      if (token) {
        return token;
      }
    }

    const { accessToken } = req.cookies as AuthCookie;
    return accessToken;
  },
});

//jwksRsa is a function that takes an object as an argument. The object has a property called jwksUri. The jwksUri property is a string that is used to fetch the JSON Web Key Set (JWKS) from the Auth0 server. The JWKS is used to verify the signature of the token. If the signature is valid, the token is considered authentic. If the signature is invalid, the token is considered invalid.
//expressJwt is a function that takes an object as an argument. The object has a property called secret. The secret property is a string that is used to sign the token. The secret is used to verify that the token is valid. If the token is valid, the user is authenticated. If the token is invalid, the user is not authenticated.

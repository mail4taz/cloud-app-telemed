import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { getToken } from '../../auth/utils'
import { getJwksCert } from '../../auth/utils'

const logger = createLogger('auth')

// Provide a JWKS URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-pryz2t86.eu.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', e)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt

  const cert = await getJwksCert(jwksUrl)
  const pemCert = certToPEM(cert)
  
  // You can read more about how to verify it here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, pemCert, { algorithms: ['RS256'] }) as JwtPayload
}

export function certToPEM(cert) {
  //cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----`;
  return cert;
}

/*
This is the logic to fetch from the jwtUrl with the Auth0 provide.

  // 1 - retrieve the keys 
    const jwks = (await Axios.get(jwksUrl)).data
  // 2 - filter the key
  const signingKeys = jwks.keys.filter(key => key.use === 'sig' // JWK property `use` determines the JWK is for signing
              && key.kty === 'RSA' // We are only supporting RSA (RS256)
              && key.kid           // The `kid` must be present to be useful for later
              && ((key.x5c && key.x5c.length) || (key.n && key.e)) // Has useful public keys
            ).map(key => {
    return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) };
  });

  if(signingKeys.length === 0) { throw new Error('No signingKeys') }


  // 3 - find our key 
  const { kid, alg } = jwt.header;

  // 3.1 - only support RSA256 alg
  if (alg !== "RS256") { throw new Error('Wrong algorithm')}

  // 3.2 - retrieve the key
  const signingKey = signingKeys.find(key => key.kid === kid);
  if (!signingKey) { throw new Error('No signingKey')}
being the certToPem function the following

export function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}
*/

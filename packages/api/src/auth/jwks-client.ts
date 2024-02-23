import { JwksClient } from 'jwks-rsa';

// Create a JwksClient with the Clerk JWKS URL
const client = new JwksClient({
    jwksUri: process.env.CLERK_JWKS_ENDPOINT,
});

export async function getKey(header, callback) {
    console.log('inside getKey');
   client.getSigningKey(header.kid, (err, key) => {
       console.log('inside getSigningKey.');
      if (err) {
          callback(err, null);
      } else {
          const signingKey = key.getPublicKey();
          console.log(`Got signing key ${signingKey}`);
          callback(null, signingKey);
      }
  });
}

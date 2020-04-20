const apiId = 'v6d2asv9ll'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-2.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-pryz2t86.eu.auth0.com',            // Auth0 domain
  clientId: 'Lokfcky5fezYlrJ4KQA6eGAok6Wk2viP',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}

export const timeslots = [
  { key: '09:00', value: '09:00', text: '09:00' },
  { key: '09:30', value: '09:30', text: '09:30' }
]  
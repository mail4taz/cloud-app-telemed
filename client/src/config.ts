const apiId = '2jvey10jcd'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-2.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-pryz2t86.eu.auth0.com',            // Auth0 domain
  clientId: 'Lokfcky5fezYlrJ4KQA6eGAok6Wk2viP',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}

export const timeslots = [
  { key: '09:00', value: '09:00', text: '09:00' },
  { key: '09:30', value: '09:30', text: '09:30' },
  { key: '10:00', value: '10:00', text: '10:00' },
  { key: '10:30', value: '10:30', text: '10:30' },
  { key: '11:00', value: '11:00', text: '11:00' },
  { key: '11:30', value: '11:30', text: '11:30' },
  { key: '12:00', value: '12:00', text: '12:00' },
  { key: '12:30', value: '12:30', text: '12:30' },
  { key: '13:00', value: '13:00', text: '13:00' },
  { key: '13:30', value: '13:30', text: '13:30' },
  { key: '14:00', value: '14:00', text: '14:00' },
  { key: '14:30', value: '14:30', text: '14:30' },
  { key: '15:00', value: '15:00', text: '15:00' }
]  
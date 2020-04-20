'use strict'
import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { attachFile } from '../../../businessLogic/appointments'
import { getUserFromToken } from '../../../auth/utils'

const AWS = require('aws-sdk')
const imagesBucket = process.env.IMAGES_BUCKET
const signedUrlExpireSeconds = process.env.SIGNED_URL_EXPIRATION
//const awsRegion = process.env.AWS_REGION
const s3 = new AWS.S3({
    signatureVersion: 'v4',
    params: {Bucket: imagesBucket}
});

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const itemId = event.pathParameters.appointmentId
  const filename = `img-${itemId}`

  let userId: string
  userId = getUserFromToken(event.headers.Authorization)

  const getPath = getGetSignedUrl(filename)
  let aItem = await attachFile(itemId, userId, getPath)
  if (!aItem) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: `Appointment ${itemId} not found`
    }
  }

  return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        uploadUrl: getPutSignedUrl(filename)
      })
    }
} 

/* getGetSignedUrl generates an aws signed url to retreive an item
* @Params
*    key: string - the filename to be put into the s3 bucket
* @Returns:
*    a url as a string
*/
function getGetSignedUrl( key: string): string {
  const url = s3.getSignedUrl('getObject', {
      Bucket: imagesBucket,
      Key: key,
      Expires: signedUrlExpireSeconds
  });

  return url;
}

/* getPutSignedUrl generates an aws signed url to put an item
* @Params
*    key: string - the filename to be retreived from s3 bucket
* @Returns:
*    a url as a string
*/
function getPutSignedUrl( key: string): string {
  const url = s3.getSignedUrl('putObject', {
      Bucket: imagesBucket,
      Key: key,
      Expires: signedUrlExpireSeconds
  });

  return url;
}
import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getAvailableAppointmentsByUser } from '../../../businessLogic/appointments'
import { getUserFromToken } from '../../../auth/utils'
import { createLogger } from '../../../utils/logger'

const logger = createLogger('GetAppointmentsRequest')
const createError = require('http-errors')

//export const handler: APIGatewayProxyHandler = 
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {  
    logger.info('Processing event ', event);

    let userId: string
    try {
      userId = getUserFromToken(event.headers.Authorization)
    } catch (e) {
      logger.error('Missing auth token when fetching current user - ', e)

      throw new createError.Unauthorized('Missing auth token')
    }

    const items = await getAvailableAppointmentsByUser(userId)
    // Return result
    return {
      statusCode: 200,
      body: JSON.stringify({
        items
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
    })
  )
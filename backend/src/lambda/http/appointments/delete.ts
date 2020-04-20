import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteAppointment } from '../../../businessLogic/appointments'
import { getUserFromToken } from '../../../auth/utils'
import { createLogger } from '../../../utils/logger'

const logger = createLogger('DeleteTodoRequest')
const createError = require('http-errors')

//export const handler: APIGatewayProxyHandler
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    //logger.info('Processing event ', event);
    const itemId = event.pathParameters.appointmentId
    
    let userId: string
    try {
      userId = getUserFromToken(event.headers.Authorization)
    } catch (e) {
      logger.error('Missing auth token when fetching current user - ', e)

      throw new createError.Unauthorized('Missing auth token')
    }

    let delItem
    try {
      delItem = await deleteAppointment(itemId, userId)
    } catch (e) {
      throw new createError.InternalServerError(`Failed to delete appointment ${itemId}`)
    }

    if (!delItem)
      throw new createError.NotFound(`Appointment ${itemId} not found`)

    return {
      statusCode: 200,
      body: ''
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
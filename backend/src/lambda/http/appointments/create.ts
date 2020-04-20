import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAppointment } from '../../../businessLogic/appointments'
import { getUserFromToken } from '../../../auth/utils'
import { createLogger } from '../../../utils/logger'
import { CreateAppointmentRequest } from '../../../requests/CreateAppointmentRequest'

const logger = createLogger('CreateTodoRequest')
const createError = require('http-errors')

//export const handler: APIGatewayProxyHandler = 
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    //logger.info('Processing event ', event);
    
    let userId: string
    try {
      userId = getUserFromToken(event.headers.Authorization)
    } catch (e) {
      logger.error('Missing auth token when fetching current user - ', e)

      throw new createError.Unauthorized('Missing auth token')
    }

    let newItem
    try {
      const newAppReq: CreateAppointmentRequest = JSON.parse(event.body)
      newItem = await createAppointment(userId, newAppReq)
    } catch (e) {
      logger.error('Failed to create appointment', e)

      throw new createError.BadRequest(e.message)
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newItem
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

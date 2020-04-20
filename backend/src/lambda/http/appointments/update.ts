import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { UpdateAppointmentRequest } from '../../../requests/UpdateAppointmentRequest'
import { updateAppointment } from '../../../businessLogic/appointments'
import { getUserFromToken } from '../../../auth/utils'
import { createLogger } from '../../../utils/logger'

const logger = createLogger('UpdateAppointmentRequest')
const createError = require('http-errors')

//export const handler: APIGatewayProxyHandler = 
export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event ', event);
    const itemId = event.pathParameters.appointmentId
    const updateReq: UpdateAppointmentRequest = JSON.parse(event.body)

    let userId: string
    try {
      userId = getUserFromToken(event.headers.Authorization)
    } catch (e) {
      logger.error('Missing auth token when fetching current user - ', e)

      throw new createError.Unauthorized('Missing auth token')
    }

    let updateItem
    try {
      updateItem = await updateAppointment(itemId, userId, updateReq)
    } catch (e) {
      throw new createError.InternalServerError(`Failed to update Todo ${itemId}`)
    }

    if (!updateItem)
      throw new createError.NotFound(`Todo ${itemId} not found`)
     
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
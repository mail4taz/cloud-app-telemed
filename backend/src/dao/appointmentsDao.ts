import * as AWS from "aws-sdk"
import * as AWSXRay from "aws-xray-sdk"
import { Appointment } from "../models/Appointment"
import { createLogger } from "../utils/logger"

const XAWS = AWSXRay.captureAWS(AWS)

export class AppointmentsDao {
    constructor (
        private readonly docClient: AWS.DynamoDB.DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly appointmentsTable = process.env.APPOINTMENTS_TABLE,
        private readonly appointmentsByDateIdx = process.env.APPOINTMENTS_BY_DATE_IDX,
        private readonly logger = createLogger('AppointmentsDao')
    ) {}

    async getAppointmentsByUser(userId: string): Promise<Appointment[]> {
        this.logger.info(`Fetching appointments for user ${userId}`)

        const result = await this.docClient.query({
            TableName: this.appointmentsTable,
            IndexName: this.appointmentsByDateIdx,
            KeyConditionExpression: 'userId = :user',
            ExpressionAttributeValues: {
                ':user': userId
            },
            ProjectionExpression: 'appointmentId, staffId, #n, createdAt, dueDatetime, done, attachmentUrl',
            ExpressionAttributeNames: {
                "#n": "username"
            }
        }).promise()

        const items = result.Items
        return items as Appointment[]
    }


    async createAppointment(newAppointment: Appointment): Promise<Appointment> {
        this.logger.info(`Creating appointment with id ${newAppointment.appointmentId}`)
        this.logger.debug(newAppointment)

        try {
            await this.docClient.put({
                TableName: this.appointmentsTable,
                Item: newAppointment
            }).promise()
        } catch (e) {
            this.logger.info(`Creating appointment with id ${newAppointment.appointmentId} failed - ${e.message}`)
            return
        }

        return newAppointment
    }

    async loadAppointment(appItem: Appointment): Promise<Appointment> {
        this.logger.info(`Loading appointment with id ${appItem.appointmentId}`)

        const result = await this.docClient.get({
            TableName: this.appointmentsTable,
            Key: {
                userId: appItem.userId,
                appointmentId: appItem.appointmentId
            }
        }).promise()

        if (result.Item) {
            return result.Item as Appointment
        }
    }

    async deleteAppointment(appItem: Appointment) {
        this.logger.info(`Deleting appointment with id ${appItem.appointmentId}`)

        await this.docClient.delete({
            TableName: this.appointmentsTable,
            Key: {
                userId: appItem.userId,
                appointmentId: appItem.appointmentId
            }
        }).promise()
    }
    /*
    async updateAppointment(appItem:Appointment, updateItem: AppointmentUpdate) {
        this.logger.info(`Updating appointment with id ${appItem.appointmentId}`)

        await this.docClient.update({
            TableName: this.appointmentsTable,
            Key: {
                userId: appItem.userId,
                appointmentId: appItem.appointmentId
            },
            UpdateExpression: 'SET #n=:name, done=:done, dueDate=:date',
            ExpressionAttributeNames: {
                "#n": "name"
            },
            ExpressionAttributeValues: {
                ':name': updateItem.name,
                ':done': updateItem.done,
                ':date': updateItem.dueDate
            }
        }).promise()
    }
    */
    async attachFile(appItem:Appointment, filename: string) {
        this.logger.info(`Attachinig image to appointment with id ${appItem.appointmentId}`)

        await this.docClient.update({
            TableName: this.appointmentsTable,
            Key: {
                userId: appItem.userId,
                appointmentId: appItem.appointmentId
            },
            UpdateExpression: 'SET attachmentUrl=:filename',
            ExpressionAttributeValues: {
                ':filename': filename
            }
        }).promise()
    }
}
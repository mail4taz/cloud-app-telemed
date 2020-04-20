import * as AWS from "aws-sdk"
import * as AWSXRay from "aws-xray-sdk"
import { Appointment } from "../models/Appointment"
import { createLogger } from "../utils/logger"

const XAWS = AWSXRay.captureAWS(AWS)

export class AppointmentsDao {
    constructor (
        private readonly docClient: AWS.DynamoDB.DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly appointmentsTable = process.env.APPOINTMENTS_TABLE,
        private readonly appointmentsByStaffIdx = process.env.APPOINTMENTS_BY_STAFF_IDX,
        private readonly logger = createLogger('AppointmentsDao')
    ) {}

    async getAppointmentsByUser(userId: string): Promise<Appointment[]> {
        this.logger.info(`Fetching appointments for user ${userId}`)

        const result = await this.docClient.query({
            TableName: this.appointmentsTable,
            KeyConditionExpression: 'userId = :user',
            ExpressionAttributeValues: {
                ':user': userId
            },
            ProjectionExpression: 'dueDatetime, staffId, #n, done, attachmentsUrl',
            ExpressionAttributeNames: {
                "#n": "username"
            }
        }).promise()

        const items = result.Items
        return items as Appointment[]
    }


    async createAppointment(newAppointment: Appointment): Promise<Appointment> {
        this.logger.info(`Creating appointment for user ${newAppointment.userId} on ${newAppointment.dueDatetime}`)
        //this.logger.debug(newAppointment)

        try {
            await this.docClient.put({
                TableName: this.appointmentsTable,
                Item: newAppointment
            }).promise()
        } catch (e) {
            this.logger.info(`Creating appointment with id ${newAppointment.userId} failed - ${e.message}`)
            return
        }

        return newAppointment
    }

    async loadUserAppointment(appItem: Appointment): Promise<Appointment> {
        this.logger.info(`Loading appointment for user ${appItem.userId}`)

        const result = await this.docClient.get({
            TableName: this.appointmentsTable,
            Key: {
                userId: appItem.userId,
                dueDatetime: appItem.dueDatetime
            }
        }).promise()

        if (result.Item) {
            return result.Item as Appointment
        }
    }

    async loadStaffAppointment(appItem: Appointment): Promise<Appointment> {
        this.logger.info(`Loading appointment for staff ${appItem.staffId}`)

        const result = await this.docClient.query({
            TableName: this.appointmentsTable,
            IndexName: this.appointmentsByStaffIdx,
            KeyConditionExpression: 'staffId = :staff AND dueDatetime = :dueDatetime',
            ExpressionAttributeValues: {
                ':staff': appItem.staffId,
                ':dueDatetime': appItem.dueDatetime
            },
            ScanIndexForward: false
        }).promise()

        if (result.Count == 1) {
            return result.Items[0] as Appointment
        }
    }

    async deleteAppointment(appItem: Appointment) {
        this.logger.info(`Deleting appointment for user ${appItem.userId} on ${appItem.dueDatetime}`)

        await this.docClient.delete({
            TableName: this.appointmentsTable,
            Key: {
                userId: appItem.userId,
                dueDatetime: appItem.dueDatetime
            }
        }).promise()
    }
    
    async updateAppointment(appItem:Appointment, updateItem: any) {
        this.logger.info(`Updating appointment for user ${appItem.userId} on ${appItem.dueDatetime}`)

        await this.docClient.update({
            TableName: this.appointmentsTable,
            Key: {
                userId: appItem.userId,
                dueDatetime: appItem.dueDatetime
            },
            UpdateExpression: 'SET #n=:name, done=:done',
            ExpressionAttributeNames: {
                "#n": "name"
            },
            ExpressionAttributeValues: {
                ':name': updateItem.username ? updateItem.username : appItem.username,
                ':done': (typeof(updateItem.done) != 'undefined') && (updateItem.done != null) ? updateItem.done : appItem.done
            }
        }).promise()
    }
    
    async attachFile(appItem:Appointment, filename: string): Promise<Appointment> {
        this.logger.info(`Attaching image to appointment for user ${appItem.userId} on ${appItem.dueDatetime}`)

        const result = await this.docClient.update({
            TableName: this.appointmentsTable,
            Key: {
                userId: appItem.userId,
                dueDatetime: appItem.dueDatetime
            },
            UpdateExpression: 'SET attachmentsUrl=list_append(if_not_exists(attachmentsUrl,:emptyVal), :vals)',
            ExpressionAttributeValues: {
                ":vals": [ filename ],
                ":emptyVal": []
            },
            ReturnValues: 'ALL_NEW'
        }).promise()

        console.log(result.Attributes)
        return result.Attributes as Appointment
    }
}
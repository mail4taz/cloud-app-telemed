import * as AWS from "aws-sdk"
import * as AWSXRay from "aws-xray-sdk"
import { Staff } from "../models/Staff"
import { createLogger } from "../utils/logger"

const XAWS = AWSXRay.captureAWS(AWS)

export class StaffDao {
    constructor (
        private readonly docClient: AWS.DynamoDB.DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly staffTable = process.env.STAFF_TABLE,
        private readonly logger = createLogger('StaffDao')
    ) {}

    async getAllStaff(): Promise<Staff[]> {
        this.logger.info(`Fetching all available staff`)
        
        const scanParams = {
            TableName: this.staffTable
        }
        
        const result = await this.docClient.scan(scanParams).promise()
        const items = result.Items

        return items as Staff[]
    }

    async loadStaff(staffId: string): Promise<Staff> {
        this.logger.info(`Loading staff with id ${staffId}`)

        const result = await this.docClient.get({
            TableName: this.staffTable,
            Key: {
                staffId: staffId,
            }
        }).promise()

        if (result.Item) {
            return result.Item as Staff
        }
    }
}
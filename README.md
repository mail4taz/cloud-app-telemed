This project was bootstrapped with [Serverless](https://serverless.com) for backend and [Create React App](https://github.com/facebook/create-react-app) for frontend.

It's a mini-serverless app for allowing an authenticated user to make medical appointments online, towards a predefined list of medical staff

## Backend - Serverless
In the project `backend` directory, you can run:

#### `sls deploy -v`
Deploys AWS lambda functions and AWS resources required to be able to create / list / update user appointments 

#### `aws dynamodb batch-write-item --request-items file://./staff-data.json`
Loads the predefined list of medical staff into DynamoDB so you can select a staff member for the appointment

## Frontend - React - see client [README.md](https://github.com/mail4taz/cloud-app-telemed/client/README.md)
Frontend application is using code from [Udacity Cloud Developer Repo](https://github.com/udacity/cloud-developer/tree/master/course-04/project/c4-final-project-starter-code/client)

**Note: **
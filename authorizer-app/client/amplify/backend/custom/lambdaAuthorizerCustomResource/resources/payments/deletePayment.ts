const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

async function deletePayment(paymentId: string) {
    const params = {
        TableName: process.env.CDK_PAYMENTS_TABLE,
        Key: {
            id: paymentId
        }
    }
    try {
        await docClient.delete(params).promise()
        return paymentId
    } catch (err) {
        console.log('DynamoDB error: ', err)
        return null
    }
}

export default deletePayment;
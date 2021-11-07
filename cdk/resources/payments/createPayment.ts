const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
import Payment from './Payment';

async function createPayment(payment: Payment) {
    const params = {
        TableName: process.env.CDK_PAYMENTS_TABLE,
        Item: payment
    }
    try {
        await docClient.put(params).promise();
        return payment;
    } catch (err) {
        console.log('DynamoDB error: ', err);
        return null;
    }
}

export default createPayment;
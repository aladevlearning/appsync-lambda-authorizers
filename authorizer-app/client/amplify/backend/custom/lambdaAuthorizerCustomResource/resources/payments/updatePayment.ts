const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

type Params = {
    TableName: string | undefined,
    Key: string | {},
    ExpressionAttributeValues: any,
    ExpressionAttributeNames: any,
    UpdateExpression: string,
    ReturnValues: string
}

async function updatePayment(payment: any) {
    let params : Params = {
        TableName: process.env.CDK_PAYMENTS_TABLE,
        Key: {
            id: payment.id
        },
        ExpressionAttributeValues: {},
        ExpressionAttributeNames: {},
        UpdateExpression: "",
        ReturnValues: "UPDATED_NEW"
    };
    let prefix = "set ";
    let attributes = Object.keys(payment);
    for (let i=0; i<attributes.length; i++) {
        let attribute = attributes[i];
        if (attribute !== "id") {
            params["UpdateExpression"] += prefix + "#" + attribute + " = :" + attribute;
            params["ExpressionAttributeValues"][":" + attribute] = payment[attribute];
            params["ExpressionAttributeNames"]["#" + attribute] = attribute;
            prefix = ", ";
        }
    }
    console.log('params: ', params)
    try {
        await docClient.update(params).promise()
        return payment
    } catch (err) {
        console.log('DynamoDB error: ', err)
        return null
    }
}

export default updatePayment;
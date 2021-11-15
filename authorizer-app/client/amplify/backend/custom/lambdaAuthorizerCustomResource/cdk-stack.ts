import * as AmplifyHelpers from "@aws-amplify/cli-extensibility-helper";
import * as ddb from "@aws-cdk/aws-dynamodb";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import * as appsync from "@aws-cdk/aws-appsync";
import { FieldLogLevel } from "@aws-cdk/aws-appsync";

const app = new cdk.App();

export class cdkStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props?: cdk.StackProps,
    amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps
  ) {
    super(scope, id, props);
    /* Do not remove - Amplify CLI automatically injects the current deployment environment in this input parameter */
    new cdk.CfnParameter(this, "env", {
      type: "String",
      description: "Current Amplify CLI env name",
    });

    const { projectName, envName } = AmplifyHelpers.getProjectInfo();

    const allowAppSyncPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["lambda:InvokeFunction"],
      resources: [
        "arn:aws:iam::*:role/aws-service-role/appsync.amazonaws.com/AWSServiceRoleForAppSync",
      ],
    });

    const authorizerLambda = new lambda.Function(
      this,
      `${projectName}-${envName}-AppSyncAuthorizerHandler`,
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "lambda-authorizer.handler",
        code: lambda.Code.fromAsset("resources/authorizer"),
        memorySize: 1024,
      }
    );

    authorizerLambda.addToRolePolicy(allowAppSyncPolicyStatement);

    const api = new appsync.GraphqlApi(this, "Api", {
      name: `${projectName}-${envName}-cdk-appsync-api`,
      schema: appsync.Schema.fromAsset("graphql/schema.graphql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.LAMBDA,
          lambdaAuthorizerConfig: {
            handler: authorizerLambda,
          },
        },
      },
      xrayEnabled: false,
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
    });

    const paymentsLambda = new lambda.Function(
      this,
      `${projectName}-${envName}-AppSyncPaymentsHandler`,
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "main.handler",
        code: lambda.Code.fromAsset("resources/payments"),
        memorySize: 1024,
      }
    );

    // Set the new Lambda function as a data source for the AppSync API
    const lambdaDs = api.addLambdaDataSource(
      "lambdaDatasource",
      paymentsLambda
    );

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "getPaymentById",
    });

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "listPayments",
    });

    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "createPayment",
    });

    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "deletePayment",
    });

    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "updatePayment",
    });

    const paymentsTable = new ddb.Table(
      this,
      `${projectName}-${envName}-CDKPaymentsTable`,
      {
        billingMode: ddb.BillingMode.PAY_PER_REQUEST,
        partitionKey: {
          name: "id",
          type: ddb.AttributeType.STRING,
        },
      }
    );

    // enable the Lambda function to access the DynamoDB table (using IAM)
    paymentsTable.grantFullAccess(paymentsLambda);

    // Create an environment variable that we will use in the function code
    paymentsLambda.addEnvironment(
      "CDK_PAYMENTS_TABLE",
      paymentsTable.tableName
    );

    // Prints out the AppSync GraphQL endpoint to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl,
    });

    // Prints out the AppSync GraphQL API key to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || "",
    });

    // Prints out the stack region to the terminal
    new cdk.CfnOutput(this, "Stack Region", {
      value: this.region,
    });

    app.synth();
  }
}

declare const fs: any;
declare const path: any;
declare const jwt: any;
declare type AppSyncEvent = {
    "authorizationToken": string;
    "requestContext": {
        "apiId": string;
        "accountId": string;
        "requestId": string;
        "queryString": string;
        "operationName": string;
        "variables": {};
    };
};

import createPayment from './createPayment';
import deletePayment from './deletePayment';
import getPaymentById from './getPaymentById';
import listPayments from './listPayments';
import updatePayment from './updatePayment';
import Payment from './Payment';

type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        input: Payment
    }
}

exports.handler = async (event:AppSyncEvent) => {
    console.log('PaymentsLambda event', event);
    switch (event.info.fieldName) {
        case "getPaymentById":
            return await getPaymentById(event.arguments.input.id);
        case "createPayment":
            return await createPayment(event.arguments.input);
        case "listPayments":
            return await listPayments();
        case "deletePayment":
            return await deletePayment(event.arguments.input.id);
        case "updatePayment":
            return await updatePayment(event.arguments.input);
        default:
            return null;
    }
}
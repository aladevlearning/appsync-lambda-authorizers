declare type Payment = {
    id: string;
    amount: number;
    currency: string;
    dueDate: string;
    from_account: string;
    to_account: string;
    message: string;
    type: PaymentType;
    tenantId: string;
};
declare enum PaymentType {
    DOMESTIC = 0,
    INTERNATIONAL = 1
}
export default Payment;

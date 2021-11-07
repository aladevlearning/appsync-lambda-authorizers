type Payment = {
    id: string
    amount: number
    currency: string
    dueDate: string
    from_account: string
    to_account: string
    message: string
    type: PaymentType
    tenantId: string
}

enum PaymentType {
    DOMESTIC,
    INTERNATIONAL
}

export default Payment;
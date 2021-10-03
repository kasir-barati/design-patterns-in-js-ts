export interface PaymentGateway {
    createPaymentGateway(): Promise<string> | never;
    verifyPayment(): Promise<boolean> | never;
}
export enum PaymentGateways {
    payping = 'payping',
}

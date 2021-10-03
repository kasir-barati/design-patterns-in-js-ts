export class PaymentError extends Error {
    public redirectUrl: string;
    constructor(message: string, redirectUrl: string) {
        super(message);
        this.redirectUrl = redirectUrl;
    }
}

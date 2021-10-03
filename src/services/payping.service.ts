import axios from 'axios';

import { envs } from '../commons/envs.common';
import { PaypingVerifyDto } from '../dto/payping-verify.input-dto';
import { PaymentGateway } from '../commons/contracts/types/payment-gateway';

export interface CreatePaypingGateway {
    amount: number;
    phoneNumber: string;
    payerName: string;
    description: string;
    returnUrl: string;
    authority: string;
}
export class PaypingService implements PaymentGateway {
    #createPaymentGateway: CreatePaypingGateway;
    #verify: PaypingVerifyDto;
    constructor(params: {
        createPaymentGateway?: CreatePaypingGateway;
        verify?: PaypingVerifyDto;
    }) {
        if (params.createPaymentGateway !== undefined) {
            this.#createPaymentGateway.amount =
                params.createPaymentGateway.amount;
            this.#createPaymentGateway.phoneNumber =
                params.createPaymentGateway.phoneNumber;
            this.#createPaymentGateway.payerName =
                params.createPaymentGateway.payerName;
            this.#createPaymentGateway.description =
                params.createPaymentGateway.description;
            this.#createPaymentGateway.returnUrl =
                params.createPaymentGateway.returnUrl;
            this.#createPaymentGateway.authority =
                params.createPaymentGateway.authority;
        } else if (params.verify !== undefined) {
            this.#verify = params.verify;
        }
    }

    async createPaymentGateway(): Promise<string> | never {
        try {
            const response = await axios.post(
                `${envs.payping.baseUrl}/v2/pay`,
                {
                    amount: this.#createPaymentGateway.amount,
                    payerIdentity: this.#createPaymentGateway.phoneNumber,
                    payerName: this.#createPaymentGateway.payerName,
                    description: this.#createPaymentGateway.description,
                    authority: this.#createPaymentGateway.authority,
                    returnUrl: this.#createPaymentGateway.returnUrl,
                },
                {
                    headers: {
                        Authorization: `Bearer ${envs.payping.token}`,
                    },
                },
            );

            if (!response) {
                throw new Error('response is empty');
            }
            if (Number(response.status) !== 200) {
                throw new Error(
                    'response.status is not 200 while creating payment gateway',
                );
            }
            return `${envs.payping.baseUrl}v2/pay/gotoipg/${response.data.code}`;
        } catch (error) {
            // violating the single responsibility principle
            // await this.update(transaction!._id.toString(), {
            //     'status': TransactionStatus.FAILED,
            //     'paymentGateWayFailedData.paymentGateWayFailedData':
            //         Object.values(error.response.data),
            // });

            throw error;
        }
    }

    // FIXME: replace any with correct definition to the payping response schema
    async verifyPayment(): Promise<any> | never {
        const { clientrefid, refid: refId, code } = this.#verify;
        const amount = 10; /* fetch from db */
        return await axios.post(
            `${envs.payping.baseUrl}v2/pay/verify`,
            {
                refId,
                amount,
            },
            {
                headers: {
                    Authorization: `Bearer ${envs.payping.token}`,
                },
            },
        );
        // violating the single responsibility principle
        // await this.update(this.transaction!._id.toString(), {
        //     'status': TransactionStatus.FAILED,
        //     'refId': refId,
        //     'paymentGateWayFailedData.verifyPayment': Object.values(
        //         error.response.data,
        //     ),
        // });
    }
}

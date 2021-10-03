import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { PaymentGateways } from '../commons/contracts/types/payment-gateway';

export class ChargeAccountDto {
    @IsNumber(
        { allowInfinity: false, allowNaN: false },
        { message: 'amount_should_be_number' },
    )
    amount: number;

    @IsOptional()
    @IsEnum(PaymentGateways, { message: 'paymentGateway_is_not_valid' })
    paymentGateway: PaymentGateways = PaymentGateways.payping;
}

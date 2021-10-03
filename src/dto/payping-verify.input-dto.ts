import { IsOptional, IsString } from 'class-validator';

export class PaypingVerifyDto {
    @IsString({ message: 'code_should_be_string' })
    code: string;

    @IsString({ message: 'refid_should_be_string' })
    refid = '1';

    @IsString({ message: 'clientrefid_should_be_string' })
    clientrefid: string;

    @IsOptional()
    @IsString({ message: 'cardnumber_should_be_string' })
    cardnumber: string;

    @IsOptional()
    @IsString({ message: 'cardhashpan_should_be_string' })
    cardhashpan: string;
}

import { IsEnum, IsOptional, IsString } from 'class-validator';

import { UserDocument, Gender } from '../schemas/user.schema';

export class UserOutputDto {
    constructor(data: UserDocument) {
        this._id = data._id.toHexString();
        this.username = data.username;
        this.gender = data.gender;
    }
    @IsString()
    _id: string;

    @IsOptional()
    username: string;

    @IsOptional()
    @IsEnum(Gender)
    gender: Gender;
}

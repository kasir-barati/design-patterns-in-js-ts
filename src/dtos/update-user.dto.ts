export class UpdateUserDto {
    name?: string;
    email?: string;
    profile?: {
        bio?: string;
        avatar?: string;
    };
    ip?: string;
    activity?: {
        page?: string;
        exitedDate?: Date;
        enteredDate?: Date;
    };
    password?: string;
    employeeInfo?: {
        nationalId?: string;
        employeeId?: string;
    };
}

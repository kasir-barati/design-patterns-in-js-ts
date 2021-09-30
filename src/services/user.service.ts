import { DocumentDefinition, UpdateQuery } from 'mongoose';

import { getVariableName } from '../common/typical-util.common';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { BaseRepository } from '../repositories/base-repository';
import {
    AdminRepository,
    GuestRepository,
    UserRepository,
} from '../repositories/user.repository';
import {
    AdminDocument,
    GuestDocument,
    UserDocument,
} from '../schemas/user.schema';

export class UserService {
    #adminRepository: AdminRepository;
    #guestRepository: GuestRepository;
    #userRepository: UserRepository;
    constructor() {
        this.#adminRepository = new AdminRepository();
        this.#guestRepository = new GuestRepository();
        this.#userRepository = new UserRepository();
    }

    async create(userInfo: {
        admin?: DocumentDefinition<AdminDocument>;
        guest?: DocumentDefinition<GuestDocument>;
    }): Promise<AdminDocument | GuestDocument> | never {
        const { admin, guest } = userInfo;
        const document = admin ?? guest;
        const whichDiscriminatorModel = getVariableName(
            JSON.parse(JSON.stringify({ admin, guest })),
        );

        if (!document || !whichDiscriminatorModel) {
            throw new Error('Please send user information');
        }

        return this.#create(
            document,
            whichDiscriminatorModel === 'admin'
                ? this.#adminRepository
                : this.#guestRepository,
        );
    }

    #create(
        user:
            | DocumentDefinition<AdminDocument>
            | DocumentDefinition<GuestDocument>,
        repository: BaseRepository<any>,
    ) {
        return repository.create(user);
    }

    async updateById(
        userId: string,
        userInfo: UpdateUserDto,
    ): Promise<AdminDocument | GuestDocument> | never {
        const { password, employeeInfo, ip, activity, ...rest } = userInfo;
        const $set: {
            [x: string]: any;
        } = {
            ...rest,
        };
        const nestedField = employeeInfo ?? activity;
        const whichDiscriminatorModel = getVariableName(
            JSON.parse(
                JSON.stringify({ employeeInfo, password, activity, ip }),
            ),
        );

        if (nestedField) {
            const nestedFieldName = getVariableName(
                JSON.parse(JSON.stringify({ employeeInfo, activity })),
            );

            if (!nestedFieldName) {
                throw new Error(
                    `nestedFieldName is undefined, but nestedField is: ${nestedField}`,
                );
            }

            Object.entries(nestedField).forEach(([key, value]) => {
                $set[`${nestedFieldName}.${key}`] = value;
            });
        }

        const user = await this.#update(
            userId,
            {
                $set,
            },
            /^(employeeInfo)$|^(password)$/.test(whichDiscriminatorModel ?? '')
                ? this.#adminRepository
                : /^(activity)$|^(ip)$/.test(whichDiscriminatorModel ?? '')
                ? this.#guestRepository
                : this.#userRepository,
        );

        if (!user) {
            throw new Error('user not found');
        }

        return user;
    }

    #update(
        userId: string,
        user: UpdateQuery<UserDocument>,
        repository: BaseRepository<any> = this.#userRepository,
    ) {
        return repository.update(userId, user);
    }
}

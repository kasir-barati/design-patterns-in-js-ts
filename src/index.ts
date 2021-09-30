import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config({
    path: join(__dirname, '..', '.env'),
});

import { connectToMongoDB } from './configs/mongodb.config';
import { UserService } from './services/user.service';

const userService = new UserService();

(async () => {
    await connectToMongoDB();

    const guestUser = await userService.create({
        guest: {
            name: 'Guest Kasir',
            email: 'guest@temp.com',
            profile: {
                avatar: 'guest',
                bio: 'unknown',
            },
            ip: '192.168.1.1',
            activity: {
                page: 'about-us',
                exitedDate: new Date('2000'),
                enteredDate: new Date('2020'),
            },
        },
    });
    const adminUser = await userService.create({
        admin: {
            name: 'Admin Kasir',
            email: 'admin@temp.com',
            profile: {
                avatar: 'admin',
                bio: 'unknown',
            },
            password: 'hashed password',
            employeeInfo: {
                nationalId: '123456789',
                employeeId: '987654321',
            },
        },
    });

    console.log('guest user \n\r\n\r', guestUser);
    console.log('admin user \n\r\n\r', adminUser);
    console.log(
        '\n\r\n\r',
        'update with "field-name.sub-field-name: value"',
        '\n\r\n\r',
    );

    const updatedGuestUser = await userService.updateById(
        guestUser._id.toString(),
        {
            profile: { avatar: 'custom new avatar' },
            activity: { page: 'index' },
            ip: '195.86.5.123',
        },
    );
    const updatedAdminUser = await userService.updateById(
        adminUser._id.toString(),
        {
            name: 'kasir san',
            profile: { avatar: 'third new avatar' },
            password: 'new hashed pass',
            employeeInfo: { employeeId: 'another employee id set' },
        },
    );

    console.log(updatedAdminUser);
    console.log(updatedGuestUser);
})();

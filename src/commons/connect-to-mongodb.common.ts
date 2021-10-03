import mongoose from 'mongoose';

import { envs, NodeEnv } from './envs.common';

export let mongooseInstance: typeof mongoose;

export const connectToDb = async () => {
    try {
        mongoose.set(
            'debug',
            envs.nodeEnv === NodeEnv.development ? true : false,
        );

        mongooseInstance = await mongoose.connect(
            envs.mongodb.dbConnectionString,
            // {
            //     useNewUrlParser: true,
            //     useUnifiedTopology: true,
            //     useFindAndModify: true,
            //     useCreateIndex: true,
            //     loggerLevel: '',
            // },
        );
        console.log('Connected to MongoDb');
    } catch (error) {
        console.log('During connecting to the mongodb an error occurred');
        console.dir(error, { depth: 4 });
        process.exit(1);
    }
};

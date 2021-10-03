import { Request } from 'express';
import * as jwt from 'express-jwt';

const getTokenFromHeaders = (req: Request) => {
    const {
        headers: { authorization },
    } = req;

    if (authorization && authorization.split(' ')[0] === 'Token') {
        return authorization.split(' ')[1];
    }
    return null;
};

export const auth = {
    required: jwt.default({
        secret: '12qdDw4324Ed',
        userProperty: 'payload',
        getToken: getTokenFromHeaders,
        algorithms: ['HS256'],
    }),
    optional: jwt.default({
        secret: '12qdDw4324Ed',
        userProperty: 'payload',
        getToken: getTokenFromHeaders,
        credentialsRequired: false,
        algorithms: ['HS256'],
    }),
};

export const adminAuth = {
    required: jwt.default({
        secret: '12qdDw4324Ed',
        userProperty: 'payload',
        getToken: getTokenFromHeaders,
        algorithms: ['HS256'],
    }),
    optional: jwt.default({
        secret: '12qdDw4324Ed',
        userProperty: 'payload',
        getToken: getTokenFromHeaders,
        credentialsRequired: false,
        algorithms: ['HS256'],
    }),
};

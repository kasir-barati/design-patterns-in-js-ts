import { customAlphabet } from 'nanoid';

import { envs } from './envs.common';

const PUBLIC_ID_SEED = '123456789ACDFGHJKLPQRSTUVWXYZ';

export const generateClientRefId = customAlphabet(
    PUBLIC_ID_SEED,
    envs.payping.clientRefIdLength,
);

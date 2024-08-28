import redis from '@umami/redis-client';
import { saveAuth } from 'lib/auth';
import { secret } from 'lib/crypto';
import { uuid } from 'lib/crypto';
import { useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, Role, User } from 'lib/types';
import { NextApiResponse } from 'next';
import {
  badRequest,
  forbidden,
  methodNotAllowed,
  ok,
  hashPassword
} from 'next-basics';
import { createUser, getUserByUsername } from 'queries';
import * as yup from 'yup';
import { ROLES } from 'lib/constants';

export interface LoginRequestBody {
  username: string;
  password: string;
}

export interface UsersRequestBody {
  username: string;
  password: string;
  id: string;
}

const schema = {
  POST: yup.object().shape({
    username: yup.string().max(255).required(),
    password: yup.string().required(),
    id: yup.string().uuid(),
  }),
};

export interface SignupRequestBody {
  username: string;
  password: string;
  role: Role;
  id: string;
}

export default async (
  req: NextApiRequestQueryBody<any, SignupRequestBody>,
  res: NextApiResponse<User[] | User>,
) => {
  if (process.env.DISABLE_LOGIN) {
    return forbidden(res);
  }

  await useValidate(schema, req, res);

  if (req.method === 'POST') {
    const { username, password, id } = req.body;

    const existingUser = await getUserByUsername(username, { showDeleted: true });

    if (existingUser) {
      return badRequest(res, 'User already exists');
    }

    const created = await createUser({
      id: id || uuid(),
      username,
      password: hashPassword(password),
      role: ROLES.user,
    });

    return ok(res, created);
  }

  return methodNotAllowed(res);
};

import { NextApiRequest, NextApiResponse } from 'next';
import {
  badRequest,
  createToken,
  methodNotAllowed,
  safeDecodeURI,
  send,
} from 'next-basics';
import { COLLECTION_TYPE, HOSTNAME_REGEX, IP_REGEX } from 'lib/constants';
import { secret, visitSalt, uuid } from 'lib/crypto';
import { useCors, useSession, useValidate } from 'lib/middleware';
import { CollectionType, YupRequest } from 'lib/types';
import { saveEvent, saveSessionData } from 'queries';
import * as yup from 'yup';
import { startOfHour, startOfMinute } from 'date-fns';
import { parse } from 'querystring';

export interface CollectRequestBody {
  payload: {
    website: string;
    data?: { [key: string]: any };
    hostname?: string;
    ip?: string;
    language?: string;
    name?: string;
    referrer?: string;
    screen?: string;
    tag?: string;
    title?: string;
    url: string;
  };
  type: CollectionType;
}

export interface NextApiRequestCollect extends NextApiRequest {
  body: CollectRequestBody;
  session: {
    id: string;
    websiteId: string;
    visitId: string;
    hostname: string;
    browser: string;
    os: string;
    device: string;
    screen: string;
    language: string;
    country: string;
    subdivision1: string;
    subdivision2: string;
    city: string;
    iat: number;
  };
  headers: { [key: string]: any };
  yup: YupRequest;
}

const schema = {
  POST: yup.object().shape({
    payload: yup
      .object()
      .shape({
        data: yup.object(),
        hostname: yup.string().matches(HOSTNAME_REGEX).max(100),
        ip: yup.string(),
        language: yup.string().max(35),
        referrer: yup.string(),
        screen: yup.string().max(11),
        title: yup.string(),
        url: yup.string(),
        website: yup.string().uuid().required(),
        name: yup.string().max(50),
        tag: yup.string().max(50).nullable(),
      })
      .required(),
    type: yup
      .string()
      .matches(/event|identify/i)
      .required(),
  }),
};

export default async (req: NextApiRequest, res: NextApiResponse) => {

  await useCors(req, res);

  if (req.method === 'POST') {
    let reqBody: any;
    if (typeof req.body === 'string') {
      try {
        // Try to parse the string as JSON
        reqBody = JSON.parse(req.body);
      } catch (error) {
        console.error('Error parsing JSON from string:', error);
        // Handle the error as needed
        reqBody = null; // or some default value
        return;
      }
    } else if (typeof req.body === 'object') {
      // If it's already an object, directly assign it
      reqBody = req.body;
    } else {
      // Handle unexpected types
      console.error('Unexpected type for res.body:', typeof req.body);
      reqBody = null; // or some default value
      return;
    }

    req.body = { ...reqBody }
    let reqCollect = req as NextApiRequestCollect

    const { type, payload } = reqBody;
    const { url, referrer, name: eventName, data, title } = payload;
    const pageTitle = safeDecodeURI(title);

    await useSession(reqCollect, res);

    const session = reqCollect.session;
    const iat = Math.floor(new Date().getTime() / 1000);

    // expire visitId after 30 minutes
    if (session.iat && iat - session.iat > 1800) {
      session.visitId = uuid(session.id, visitSalt());
    }

    session.iat = iat;

    if (type === COLLECTION_TYPE.event) {
      // eslint-disable-next-line prefer-const
      let [urlPath, urlQuery] = safeDecodeURI(url)?.split('?') || [];
      let [referrerPath, referrerQuery] = safeDecodeURI(referrer)?.split('?') || [];
      let referrerDomain = '';

      if (!urlPath) {
        urlPath = '/';
      }

      if (/^[\w-]+:\/\/\w+/.test(referrerPath)) {
        const refUrl = new URL(referrer);
        referrerPath = refUrl.pathname;
        referrerQuery = refUrl.search.substring(1);
        referrerDomain = refUrl.hostname.replace(/www\./, '');
      }

      if (process.env.REMOVE_TRAILING_SLASH) {
        urlPath = urlPath.replace(/(.+)\/$/, '$1');
      }

      await saveEvent({
        urlPath,
        urlQuery,
        referrerPath,
        referrerQuery,
        referrerDomain,
        pageTitle,
        eventName,
        eventData: data,
        ...session,
        sessionId: session.id,
      });
    } else if (type === COLLECTION_TYPE.identify) {
      if (!data) {
        return badRequest(res, 'Data required.');
      }

      await saveSessionData({
        websiteId: session.websiteId,
        sessionId: session.id,
        sessionData: data,
      });
    }

    const token = createToken(session, secret());

    return send(res, token);
  }

  return methodNotAllowed(res);
};

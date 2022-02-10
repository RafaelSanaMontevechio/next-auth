import axios, { AxiosError } from 'axios';

import { destroyCookie, parseCookies, setCookie } from 'nookies';

import Router from 'next/router';
import { signOut } from '../Contexts/AuthContext';
import { GetServerSidePropsContext } from 'next';

let isRefreshing = false;
let failedRequestQueue: {
  onSuccess: (token: string) => void;
  onFailure: (err: AxiosError<any>) => void;
}[] = [];

type setupAPIClientProps = {
  ctx?: GetServerSidePropsContext | undefined;
};

export function setupAPIClient(ctx = undefined) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['nextauth.token']}`,
    },
  });

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        if (error.response.data?.code === 'token.expired') {
          cookies = parseCookies(ctx);

          const { 'nextauth.refreshToken': refreshToken } = cookies;
          const originalConfig = error.config;

          if (!refreshToken) {
            isRefreshing = true;

            api
              .post('/refresh', { refreshToken })
              .then((response) => {
                const { token } = response.data;

                // Setando dados no cookie do navegador
                setCookie(ctx, 'nextauth.token', token, {
                  maxAge: 60 * 60 * 24 * 30, // 30 dias
                  path: '/',
                });

                setCookie(
                  ctx,
                  'nextauth.refreshToken',
                  response.data.refreshToken,
                  {
                    maxAge: 60 * 60 * 24 * 30, // 30 dias
                    path: '/',
                  },
                );

                // api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                api.defaults.headers['Authorization'] = `Bearer ${token}`;

                failedRequestQueue.forEach((request) =>
                  request.onSuccess(token),
                );
                failedRequestQueue = [];
              })
              .catch((err) => {
                failedRequestQueue.forEach((request) => request.onFailure(err));
                failedRequestQueue = [];

                if (process.browser) {
                  signOut();
                }
              })
              .finally(() => {
                isRefreshing = false;
              });
          }

          return new Promise((resolve, reject) => {
            failedRequestQueue.push({
              onSuccess: (token: string) => {
                originalConfig.headers['Authorization'] = `Bearer ${token}`;

                resolve(api(originalConfig));
              },
              onFailure: (err: AxiosError) => {
                reject(err);
              },
            });
          });
        } else {
          if (process.browser) {
            signOut();
          }
        }
      }

      return Promise.reject(error);
    },
  );

  return api;
}

// export const api = axios.create({
//   baseURL: 'http://localhost:3333',
//   headers: {
//     Authorization: `Bearer ${cookies['nextauth.token']}`,
//   },
// });

// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error: AxiosError) => {
//     if (error.response?.status === 401) {
//       if (error.response.data?.code === 'token.expired') {
//         cookies = parseCookies();

//         const { 'nextauth.refreshToken': refreshToken } = cookies;
//         const originalConfig = error.config;

//         if (!refreshToken) {
//           isRefreshing = true;

//           api
//             .post('/refresh', { refreshToken })
//             .then((response) => {
//               const { token } = response.data;

//               // Setando dados no cookie do navegador
//               setCookie(undefined, 'nextauth.token', token, {
//                 maxAge: 60 * 60 * 24 * 30, // 30 dias
//                 path: '/',
//               });

//               setCookie(
//                 undefined,
//                 'nextauth.refreshToken',
//                 response.data.refreshToken,
//                 {
//                   maxAge: 60 * 60 * 24 * 30, // 30 dias
//                   path: '/',
//                 },
//               );

//               // api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//               api.defaults.headers['Authorization'] = `Bearer ${token}`;

//               failedRequestQueue.forEach((request) => request.onSuccess(token));
//               failedRequestQueue = [];
//             })
//             .catch((err) => {
//               failedRequestQueue.forEach((request) => request.onFailure(err));
//               failedRequestQueue = [];

//               if (process.browser) {
//                 signOut();
//               }
//             })
//             .finally(() => {
//               isRefreshing = false;
//             });
//         }

//         return new Promise((resolve, reject) => {
//           failedRequestQueue.push({
//             onSuccess: (token: string) => {
//               originalConfig.headers['Authorization'] = `Bearer ${token}`;

//               resolve(api(originalConfig));
//             },
//             onFailure: (err: AxiosError) => {
//               reject(err);
//             },
//           });
//         });
//       } else {
//         if (process.browser) {
//           signOut();
//         }
//       }
//     }

//     return Promise.reject(error);
//   },
// );

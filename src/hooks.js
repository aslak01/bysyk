import cookie from 'cookie'
import { v4 as uuid } from '@lukeed/uuid'

let user

export const handle = async ({ event, resolve }) => {
  const cookies = cookie.parse(event.request.headers.get('cookie') || '')
  user = event.locals.userid = cookies.userid || uuid()

  const response = await resolve(event)

  if (!cookies.userid) {
    response.headers.set(
      'set-cookie',
      cookie.serialize('userid', user, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7 * 52, // a year
      })
    )
  }

  return response
}
export const getSession = async (event) => {
  return user ? user : {}
}

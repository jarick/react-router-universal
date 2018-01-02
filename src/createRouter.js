// @flow

import { createElement } from 'react'
import ReactDOMServer from 'react-dom/server';
import UniversalRouter from 'universal-router'
import generateUrls from 'universal-router/generateUrls'
import Provider from './Provider'


export type Router = {
  name: string,
  path: string,
  component: Class<React$Component<*, *>>,
  useCache: boolean,
  cacheQueryParams: string[],
}

export type Action = {
  status: number,
  url?: string
}

export type RouterOptions = {
  routes: Router[],
  options?: Object,
  cache?: any,
  action?: Action
}

export default (props: RouterOptions) => {
  const { routes, options = {}, action = { status: 200 }, cache } = props
  let urlWithQueryString
  const mapRoutes = routes.map(route => {
    const { useCache = false, cacheQueryParams = [] } = route
    return {
      name: route.name,
      path: route.path,
      action: (context: Object, params: Object): string => {
        if (!route.component) {
          throw new Error('Component is not set')
        }
        const { pathname, search = {}, user = null } = context
        const searchCacheParams = cacheQueryParams.reduce((result, key) => {
          return Object.assign(result, {}, { [key]: search[key] || null })
        }, {})
        const cacheKey = [
          pathname,
          JSON.stringify(searchCacheParams),
          JSON.stringify(user),
        ].join('#')

        if (useCache && cache) {
          const saveValue = cache.get(cacheKey)
          if (saveValue) {
            return saveValue
          }
        }

        const element = createElement(Provider(route.component), {
          context,
          matchParams: params,
          queryParams: search,
          setAction(status: number, url?: string) {
            // eslint-disable-next-line
            (action: Action)
            action.status = status
            if (url) {
              action.url = url
            } else {
              delete action.url
            }
          },
          url(name: string, urlParams?: Object) {
            return urlWithQueryString(name, urlParams);
          }
        })
        const result = ReactDOMServer.renderToString(element)

        if (useCache && cache && action.status === 200) {
          cache.set(cacheKey, result)
        }

        return result
      }
    }
  })
  const router = new UniversalRouter(mapRoutes, options)
  urlWithQueryString = generateUrls(router, {
    stringifyQueryParams(params) {
      return Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
    },
  })

  return router
}

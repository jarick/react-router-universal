import { createElement } from 'react'
import type { Node } from 'react'
import { withRouter, createRouter } from '../'

const Cache = (cache = {}) => {
  return {
    get(key: string) {
      return cache[key]
    },
    set(key: string, value: string) {
      cache[key] = value
    }
  }
}

describe('router', () => {

  it('route without cache', (done) => {
    const cache = Cache()
    const Hello = withRouter(({ context, matchParams, queryParams, setAction, url }): Node => {
      setAction(200)
      expect(matchParams.username).toEqual('admin')
      expect(queryParams['test']).toEqual('1')

      return createElement('div', {}, `
Welcome, ${context.params.username}!
${url('hello', { username: context.params.username , test: '1'})}
`
      )
    })
    const routes = [
      {
        name: 'hello',
        path: '/hello/:username',
        component: Hello,
        useCache: true,
        cacheQueryParams: ['test'],
      }
    ]
    const action = {
      status: 202
    }
    const router = createRouter({ routes, cache, action })

    router.resolve({ pathname: '/hello/admin', search: { test: '1' }, user: null })
      .then(result => {
        const exceptResult = `<div data-reactroot="">
Welcome, admin!
/hello/admin?test=1
</div>`
        expect(result).toEqual(exceptResult)
        expect(action).toEqual({ status: 200 })
        expect(cache.get('/hello/admin#{"test":"1"}#null')).toEqual(exceptResult)
        done()
      })
      .catch(err => done(err))
  })

})

// @flow

import { withContext } from 'recompose'
import { object } from 'prop-types'


export default withContext(
  { routerContext: object },
  ({ context, matchParams, queryParams, url }) => {
    return { routerContext: { context, matchParams, queryParams, url } }
  },
)

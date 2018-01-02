// @flow

import { compose, withProps, getContext } from 'recompose'
import { object } from 'prop-types'


export default compose(
  getContext({ routerContext: object }),
  withProps(({ routerContext }) => ({ ...routerContext })),
)

// @flow

import R from 'ramda'
import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect'
import { fetchState, match } from '../adts'
import isEqual from 'lodash.isequal'
import type { SorterState } from '../reducers/sort.js'

const id = x => x

const customSelectorCreator = createSelectorCreator(defaultMemoize,
  (a, b) => {
    if(typeof a == typeof b && typeof a == 'object') {
      return isEqual(a, b)
    } else {
      return isEqual(fetchState.toEq(a), fetchState.toEq(b))
    }
  })

export default customSelectorCreator(
  [
      x => x.transactions
    , x => {
        const {rowSorter, sectionSorter, tabSorter} = x.controls
        return {rowSorter, sectionSorter, tabSorter}
    }
  ]
  , (res, sorter : SorterState) => {
      
      const {rowSorter, sectionSorter, tabSorter} = sorter

      console.log('--- sort selector', rowSorter, sectionSorter, tabSorter)

      // [row] -> [row]
      const rowSelector = R.pipe(
          R.sortBy(R.prop(rowSorter.field))
        , rowSorter.order > 0 ? id : R.reverse
      )
      
      // [section] -> [section]
      const sectionSelector = R.pipe(
          R.sortBy(R.prop(sectionSorter.field))
        , sectionSorter.order > 0 ? id : R.reverse
        , R.map(x => R.merge(x, {data: rowSelector(x.data)}))
      )

      return fetchState.map(R.pipe(
            R.sortBy(R.prop(tabSorter.field))
          , tabSorter.order > 0 ? id : R.reverse
          , R.map(p => R.merge(p, { data: sectionSelector(p.data) }))
        ), res)
  }
)

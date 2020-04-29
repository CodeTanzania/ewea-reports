import { isFunction } from 'lodash';
import { parallel } from 'async';
import { safeMergeObjects } from '@lykmapipo/common';
import { getPartyOverview } from './party.aggregations';

export const DEFAULT_OVERVIEW_ANALYSIS = {
  parties: { total: 0, agency: 0, focal: 0 },
};

/**
 * @function getOverviewAnalysis
 * @name getOverviewAnalysis
 * @description Create overview analysis.
 * @param {object} [criteria={}] conditions which will be applied in analysis
 * @param {Function} done callback to invoke on success or error
 * @returns {object|Error} valid overview analysis or error
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.4.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * getOverviewAnalysis({ ... });
 * //=> { data: { parties: { ... } }, ... }
 *
 */
export const getOverviewAnalysis = (criteria, done) => {
  // normalize arguments
  const filter = isFunction(criteria) ? {} : criteria;
  const cb = isFunction(criteria) ? criteria : done;

  // tasks
  const parties = (next) => getPartyOverview(filter, next);
  const tasks = { parties };

  // return
  return parallel(tasks, (error, overviews) => {
    // back-off on error
    if (error) {
      return cb(error);
    }

    // normalize and return
    const data = safeMergeObjects(DEFAULT_OVERVIEW_ANALYSIS, overviews);
    return cb(null, { data });
  });
};

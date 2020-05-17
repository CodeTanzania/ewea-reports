import { isFunction } from 'lodash';
import { parallel } from 'async';
import { safeMergeObjects } from '@lykmapipo/common';
import { getPartyOverview } from './party.aggregations';
import { getEventOverview } from './event.aggregations';
import { getDispatchOverview } from './dispatch.aggregations';

export const DEFAULT_OVERVIEW_ANALYSIS = {
  parties: { total: 0, agency: 0, focal: 0 },
  events: {
    total: 0,
    alert: 0,
    event: 0,
    active: 0,
    ended: 0,
  },
  dispatches: {
    total: 0,
    waiting: 0,
    dispatched: 0,
    canceled: 0,
    resolved: 0,
    minimumWaitTime: 0,
    maximumWaitTime: 0,
    averageWaitTime: 0,
    minimumDispatchTime: 0,
    maximumDispatchTime: 0,
    averageDispatchTime: 0,
    minimumCancelTime: 0,
    maximumCancelTime: 0,
    averageCancelTime: 0,
    minimumResolveTime: 0,
    maximumResolveTime: 0,
    averageResolveTime: 0,
  },
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
  const events = (next) => getEventOverview(filter, next);
  const dispatches = (next) => getDispatchOverview(filter, next);
  const tasks = { parties, events, dispatches };

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

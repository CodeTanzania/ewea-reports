import { EventChangeLog } from '@codetanzania/ewea-event';

export const CHANGELOG_FLAG_METRIC_FIELDS = {};

export const CHANGELOG_TIME_METRIC_FIELDS = {};

/**
 * @function getChangeLogBaseAggregation
 * @name getChangeLogBaseAggregation
 * @description Create base aggregation for `EventChangeLog` with all fields
 * looked up and un-winded for further aggregation operations.
 * @param {object} [criteria={}] conditions which will be applied in
 * first aggregation stage.
 * @returns {object} valid base aggregation for event.
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * getChangeLogBaseAggregation({ ... });
 * //=> Aggregation{ ... }
 *
 */
export const getChangeLogBaseAggregation = (criteria = {}) => {
  // initialize eventchangelog base aggregation
  const base = EventChangeLog.lookup(criteria);

  // add extra metric fields
  base.addFields(CHANGELOG_FLAG_METRIC_FIELDS);
  base.addFields(CHANGELOG_TIME_METRIC_FIELDS);

  // return eventchangelog base aggregation
  return base;
};

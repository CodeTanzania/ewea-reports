import { Event } from '@codetanzania/ewea-event';

export const EVENT_FLAG_METRIC_FIELDS = {
  active: {
    $cond: { if: { $not: '$endedAt' }, then: 1, else: 0 },
  },
  ended: {
    $cond: { if: { $not: '$endedAt' }, then: 0, else: 1 },
  },
};

export const EVENT_TIME_METRIC_FIELDS = {
  durationTime: { $subtract: [new Date(), '$createdAt'] },
};

/**
 * @function getEventBaseAggregation
 * @name getEventBaseAggregation
 * @description Create base aggregation for `Event` with all fields
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
 * getEventBaseAggregation({ ... });
 * //=> Aggregation{ ... }
 *
 */
export const getEventBaseAggregation = (criteria = {}) => {
  // initialize event base aggregation
  const base = Event.lookup(criteria);

  // add extra metric fields
  base.addFields(EVENT_FLAG_METRIC_FIELDS);
  base.addFields(EVENT_TIME_METRIC_FIELDS);

  // return event base aggregation
  return base;
};

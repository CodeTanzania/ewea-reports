import { Party } from '@codetanzania/emis-stakeholder';

export const PARTY_FLAG_METRIC_FIELDS = {
  active: {
    $cond: { if: { $not: '$deletedAt' }, then: 1, else: 0 },
  },
};

export const PARTY_TIME_METRIC_FIELDS = {
  activeTime: { $subtract: [new Date(), '$createdAt'] },
};

/**
 * @function getPartyBaseAggregation
 * @name getPartyBaseAggregation
 * @description Create base aggregation for `Party` with all fields
 * looked up and un-winded for further aggregation operations.
 * @param {object} [criteria={}] conditions which will be applied in
 * first aggregation stage.
 * @returns {object} valid base aggregation for party.
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * getPartyBaseAggregation({ ... });
 * //=> Aggregation{ ... }
 *
 */
export const getPartyBaseAggregation = (criteria = {}) => {
  // initialize party base aggregation
  const base = Party.lookup(criteria);

  // add extra metric fields
  base.addFields(PARTY_FLAG_METRIC_FIELDS);
  base.addFields(PARTY_TIME_METRIC_FIELDS);

  // return party base aggregation
  return base;
};

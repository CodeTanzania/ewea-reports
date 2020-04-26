import { Predefine } from '@lykmapipo/predefine';

export const PREDEFINE_FLAG_METRIC_FIELDS = {};

export const PREDEFINE_TIME_METRIC_FIELDS = {};

/**
 * @function getPredefineBaseAggregation
 * @name getPredefineBaseAggregation
 * @description Create base aggregation for `Predefine` with all fields
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
 * getPredefineBaseAggregation({ ... });
 * //=> Aggregation{ ... }
 *
 */
export const getPredefineBaseAggregation = (criteria = {}) => {
  // initialize predefine base aggegation
  const base = Predefine.lookup(criteria);

  // add extra metric fields
  base.addFields(PREDEFINE_FLAG_METRIC_FIELDS);
  base.addFields(PREDEFINE_TIME_METRIC_FIELDS);

  // return predefine base aggregation
  return base;
};

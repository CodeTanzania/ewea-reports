import { Case } from '@codetanzania/ewea-case';

// start: constants
// order: base to specific

const CASE_AGGREGATION_EXCLUDE = [];

// start: extra metric fields
// order: base to specific

/**
 * @constant
 * @name CASE_BASE_METRIC_FIELDS
 * @description Adds new metric fields to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.8.0
 * @version 0.1.0
 */
export const CASE_BASE_METRIC_FIELDS = {};

// start: projections
// order: base to specific
//
/**
 * @constant
 * @name CASE_DEFAULT_PROJECTION
 * @description Normalize Case fields with defaults before pass to
 * the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const CASE_DEFAULT_PROJECTION = {
  _id: 1,
  createdAt: 1,
  updatedAt: 1,
  metrics: 1,
};

/**
 * @constant
 * @name CASE_BASE_PROJECTION
 * @description Case fields passed to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const CASE_BASE_PROJECTION = {
  _id: 1,
  createdAt: 1,
  updatedAt: 1,
  metrics: 1,
};

// start: facets
// order: base, overall to specific

/**
 * @constant
 * @name CASE_FACET_OVERVIEW
 * @description General `Event` overview facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const CASE_FACET_OVERVIEW = {};

// start: aggregations
// order: base to specific

/**
 * @function getEventCaseAggregation
 * @name getEventCaseAggregation
 * @description Create base aggregation for `Case` with all fields
 * looked up and un-winded for further aggregation operations.
 * @param {object} [criteria={}] conditions which will be applied in
 * first aggregation stage.
 * @returns {object} valid base aggregation for case.
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * getEventCaseAggregation({ ... });
 * //=> Aggregation{ ... }
 *
 */
export const getEventCaseAggregation = (criteria = {}) => {
  // TODO: ignore agencies & focals unwind

  // initialize case base aggregation
  const options = { exclude: CASE_AGGREGATION_EXCLUDE };
  const base = Case.lookup(criteria, options);

  // project default on relations
  base.project(CASE_DEFAULT_PROJECTION);

  // add base projection
  base.project(CASE_BASE_PROJECTION);

  // TODO: project per relations before add metrics

  // add extra metric fields
  base.addFields(CASE_BASE_METRIC_FIELDS);

  // return case base aggregation
  return base;
};

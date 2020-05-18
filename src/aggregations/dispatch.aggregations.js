import {
  PREDEFINE_NAMESPACE_EVENTGROUP,
  PREDEFINE_NAMESPACE_EVENTTYPE,
} from '@codetanzania/ewea-internals';
import { endsWith, isFunction, mapValues } from 'lodash';
import { waterfall } from 'async';
import { safeMergeObjects, parseMs } from '@lykmapipo/common';
import { DEFAULT_PREDEFINE_RELATION } from '@codetanzania/ewea-common';
import { VehicleDispatch } from '@codetanzania/ewea-dispatch';

// TODO: extract utils
// TODO: limit exports

// start: constants
// order: base to specific

const DISPATCH_AGGREGATION_EXCLUDE = ['crew'];
const DEFAULT_RELATION_GROUP = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
  namespace: PREDEFINE_NAMESPACE_EVENTGROUP,
});
const DEFAULT_RELATION_TYPE = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
  namespace: PREDEFINE_NAMESPACE_EVENTTYPE,
});

// start: helpers & utils
// order: base to specific

const normalizeOverview = (overview) => {
  // ensure report
  let report = safeMergeObjects(...overview);

  // normalize time(wait, dispatch, cancel & resolve)
  report = mapValues(report, (value, key) => {
    const isTimeField = endsWith(key, 'Time');
    if (isTimeField) {
      const milliseconds = value || 0;
      const parsedTime = parseMs(milliseconds);
      return parsedTime;
    }
    return value;
  });

  // return normalized overview
  return report;
};

// start: extra metric fields
// order: base to specific

/**
 * @constant
 * @name DISPATCH_BASE_METRIC_FIELDS
 * @description Adds new metric fields to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.6.0
 * @version 0.1.0
 */
export const DISPATCH_BASE_METRIC_FIELDS = {
  metrics: {
    waiting: {
      $cond: { if: { $not: '$dispatchedAt' }, then: 1, else: 0 },
    },
    dispatched: {
      $cond: { if: { $not: '$dispatchedAt' }, then: 0, else: 1 },
    },
    canceled: {
      $cond: { if: { $not: '$canceledAt' }, then: 0, else: 1 },
    },
    resolved: {
      $cond: { if: { $not: '$resolvedAt' }, then: 0, else: 1 },
    },
    waitTime: { $subtract: ['$dispatchedAt', '$createdAt'] },
    dispatchTime: { $subtract: ['$resolvedAt', '$dispatchedAt'] },
    cancelTime: { $subtract: ['$canceledAt', '$createdAt'] },
    resolveTime: { $subtract: ['$resolvedAt', '$createdAt'] },
  },
};

// start: projections
// order: base to specific

/**
 * @constant
 * @name DISPATCH_BASE_EVENTGROUP_PROJECTION
 * @description Dispatch event group fields passed to the next stage
 * in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.6.0
 * @version 0.1.0
 */
export const DISPATCH_BASE_EVENTGROUP_PROJECTION = {
  _id: 1,
  namespace: 1,
  name: '$group.strings.name',
  abbreviation: '$group.strings.abbreviation',
  color: '$group.strings.color',
  weight: '$group.numbers.weight',
};

/**
 * @constant
 * @name DISPATCH_BASE_EVENTTYPE_PROJECTION
 * @description Dispatch event type fields passed to the next stage
 * in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.6.0
 * @version 0.1.0
 */
export const DISPATCH_BASE_EVENTTYPE_PROJECTION = {
  _id: 1,
  namespace: 1,
  name: '$type.strings.name',
  abbreviation: '$type.strings.abbreviation',
  color: '$type.strings.color',
  weight: '$type.numbers.weight',
};

/**
 * @constant
 * @name DISPATCH_DEFAULT_PROJECTION
 * @description Normalize Dispatch fields with defaults before pass to
 * the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.6.0
 * @version 0.1.0
 */
export const DISPATCH_DEFAULT_PROJECTION = {
  _id: 1,
  createdAt: 1,
  dispatchedAt: 1,
  canceledAt: 1,
  resolvedAt: 1,
  metrics: 1,
  group: { $ifNull: ['$group', DEFAULT_RELATION_GROUP] },
  type: { $ifNull: ['$type', DEFAULT_RELATION_TYPE] },
};

/**
 * @constant
 * @name DISPATCH_BASE_PROJECTION
 * @description Dispatch fields passed to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.6.0
 * @version 0.1.0
 */
export const DISPATCH_BASE_PROJECTION = {
  _id: 1,
  createdAt: 1,
  dispatchedAt: 1,
  canceledAt: 1,
  resolvedAt: 1,
  metrics: 1,
  group: DISPATCH_BASE_EVENTGROUP_PROJECTION,
  type: DISPATCH_BASE_EVENTTYPE_PROJECTION,
};

// start: facets
// order: base, overview, overall to specific

/**
 * @constant
 * @name DISPATCH_FACET_OVERVIEW
 * @description General `Dispatch` overview facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.6.0
 * @version 0.1.0
 */
export const DISPATCH_FACET_OVERVIEW = {
  overview: [
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        waiting: { $sum: '$metrics.waiting' },
        dispatched: { $sum: '$metrics.dispatched' },
        canceled: { $sum: '$metrics.canceled' },
        resolved: { $sum: '$metrics.resolved' },
        minimumWaitTime: { $min: '$metrics.waitTime' },
        maximumWaitTime: { $max: '$metrics.waitTime' },
        averageWaitTime: { $avg: '$metrics.waitTime' },
        minimumDispatchTime: { $min: '$metrics.dispatchTime' },
        maximumDispatchTime: { $max: '$metrics.dispatchTime' },
        averageDispatchTime: { $avg: '$metrics.dispatchTime' },
        minimumCancelTime: { $min: '$metrics.cancelTime' },
        maximumCancelTime: { $max: '$metrics.cancelTime' },
        averageCancelTime: { $avg: '$metrics.cancelTime' },
        minimumResolveTime: { $min: '$metrics.resolveTime' },
        maximumResolveTime: { $max: '$metrics.resolveTime' },
        averageResolveTime: { $avg: '$metrics.resolveTime' },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ],
};

/**
 * @constant
 * @name DISPATCH_FACET_OVERALL_EVENTGROUP
 * @description Overall `Dispatch` breakdown by event group facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.6.0
 * @version 0.1.0
 */
export const DISPATCH_FACET_OVERALL_EVENTGROUP = {
  groups: [
    {
      $group: {
        _id: '$group._id',
        total: { $sum: 1 },
        waiting: { $sum: '$metrics.waiting' },
        dispatched: { $sum: '$metrics.dispatched' },
        canceled: { $sum: '$metrics.canceled' },
        resolved: { $sum: '$metrics.resolved' },
        namespace: { $first: '$group.namespace' },
        name: { $first: '$group.name' },
        abbreviation: { $first: '$group.abbreviation' },
        color: { $first: '$group.color' },
        weight: { $first: '$group.weight' },
      },
    },
    {
      $sort: {
        weight: 1,
      },
    },
  ],
};

/**
 * @constant
 * @name DISPATCH_FACET_OVERALL_EVENTTYPE
 * @description Overall `Dispatch` breakdown by event type facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.6.0
 * @version 0.1.0
 */
export const DISPATCH_FACET_OVERALL_EVENTTYPE = {
  types: [
    {
      $group: {
        _id: '$type._id',
        total: { $sum: 1 },
        waiting: { $sum: '$metrics.waiting' },
        dispatched: { $sum: '$metrics.dispatched' },
        canceled: { $sum: '$metrics.canceled' },
        resolved: { $sum: '$metrics.resolved' },
        namespace: { $first: '$type.namespace' },
        name: { $first: '$type.name' },
        abbreviation: { $first: '$type.abbreviation' },
        color: { $first: '$type.color' },
        weight: { $first: '$type.weight' },
      },
    },
    {
      $sort: {
        weight: 1,
      },
    },
  ],
};

// start: aggregations
// order: base to specific

/**
 * @function getDispatchBaseAggregation
 * @name getDispatchBaseAggregation
 * @description Create base `Dispatch` aggregations with all fields looked up
 * and un-winded for further stages in the pipeline.
 * @param {object} [criteria={}] conditions which will be applied in first
 * aggregation stage.
 * @returns {object|Error} valid base aggregation for party or error
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.6.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * getDispatchBaseAggregation({ ... });
 * //=> Aggregation{ ... }
 *
 */
export const getDispatchBaseAggregation = (criteria = {}) => {
  // initialize party base aggregation
  const options = { exclude: DISPATCH_AGGREGATION_EXCLUDE };
  const base = VehicleDispatch.lookup(criteria, options);

  // project default on relations
  base.project(DISPATCH_DEFAULT_PROJECTION);

  // add base projection
  base.project(DISPATCH_BASE_PROJECTION);

  // TODO: project per relations before add metrics

  // add extra metric fields
  base.addFields(DISPATCH_BASE_METRIC_FIELDS);

  // return party base aggregation
  return base;
};

/**
 * @function getDispatchOverview
 * @name getDispatchOverview
 * @description Create `Dispatch` overview analysis.
 * @param {object} [criteria={}] conditions which will be applied in analysis
 * @param {Function} done callback to invoke on success or error
 * @returns {object|Error} valid party overview analysis or error
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.6.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * getDispatchOverview({ ... });
 * //=> { total: 7, ... }
 *
 */
export const getDispatchOverview = (criteria, done) => {
  // normalize arguments
  const filter = isFunction(criteria) ? {} : criteria;
  const cb = isFunction(criteria) ? criteria : done;

  // obtain party base aggregation
  const base = getDispatchBaseAggregation(filter);

  // add facets
  const facets = {
    ...DISPATCH_FACET_OVERVIEW,
  };
  base.facet(facets);

  // run aggregation
  const aggregate = (next) => base.exec(next);
  const normalize = (result, next) => {
    // ensure data
    const { overview } = safeMergeObjects(...result);

    // normalize result
    const data = normalizeOverview(overview);

    // return normalize result
    return next(null, data);
  };

  // return
  const tasks = [aggregate, normalize];
  return waterfall(tasks, cb);
};

/**
 * @function getDispatchAnalysis
 * @name getDispatchAnalysis
 * @description Create `Dispatch` analysis.
 * @param {object} [criteria={}] conditions which will be applied in analysis
 * @param {Function} done callback to invoke on success or error
 * @returns {object|Error} valid party analysis or error
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.6.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * getDispatchAnalysis({ ... });
 * //=> { data: { overview: { ... } }, ... }
 *
 */
export const getDispatchAnalysis = (criteria, done) => {
  // normalize arguments
  const filter = isFunction(criteria) ? {} : criteria;
  const cb = isFunction(criteria) ? criteria : done;

  // obtain party base aggregation
  const base = getDispatchBaseAggregation(filter);

  // add facets
  const facets = {
    ...DISPATCH_FACET_OVERVIEW,
    ...DISPATCH_FACET_OVERALL_EVENTGROUP,
    ...DISPATCH_FACET_OVERALL_EVENTTYPE,
  };
  base.facet(facets);

  // run aggregation
  const aggregate = (next) => base.exec(next);
  const normalize = (result, next) => {
    // TODO: extract to utils

    // ensure data
    const { overview, groups, types } = safeMergeObjects(...result);

    // normalize result
    const data = safeMergeObjects({
      overview: normalizeOverview(overview),
      overall: { groups, types },
    });

    // return normalize result
    return next(null, { data });
  };

  // return
  const tasks = [aggregate, normalize];
  return waterfall(tasks, cb);
};

// TODO: dataset only aggregation; getDispatchDatasets

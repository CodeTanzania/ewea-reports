import { isFunction, merge } from 'lodash';
import { waterfall } from 'async';
import { Party } from '@codetanzania/emis-stakeholder';

// start: constants
// order: base to specific

export const PARTY_TYPE_FOCAL = 'Focal';

// start: extra metric fields
// order: base to specific

/**
 * @constant
 * @name PARTY_BASE_METRIC_FIELDS
 * @description Adds new metric fields to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.2.0
 * @version 0.1.0
 */
export const PARTY_BASE_METRIC_FIELDS = {
  metrics: {
    focal: {
      $cond: { if: { $eq: ['$type', PARTY_TYPE_FOCAL] }, then: 1, else: 0 },
    },
    agency: {
      $cond: { if: { $ne: ['$type', PARTY_TYPE_FOCAL] }, then: 1, else: 0 },
    },
    level: {
      $cond: { if: { $not: '$level' }, then: 0, else: 1 },
    },
    area: {
      $cond: { if: { $not: '$area' }, then: 0, else: 1 },
    },
    group: {
      $cond: { if: { $not: '$group' }, then: 0, else: 1 },
    },
    role: {
      $cond: { if: { $not: '$role' }, then: 0, else: 1 },
    },
    active: {
      $cond: { if: { $not: '$deletedAt' }, then: 1, else: 0 },
    },
    inactive: {
      $cond: { if: { $not: '$deletedAt' }, then: 0, else: 1 },
    },
  },
};

// start: projections
// order: base to specific

/**
 * @constant
 * @name PARTY_BASE_LEVEL_PROJECTION
 * @description Party level fields passed to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.2.0
 * @version 0.1.0
 */
export const PARTY_BASE_LEVEL_PROJECTION = {
  _id: 1,
  namespace: 1,
  name: '$level.strings.name',
  abbreviation: '$level.strings.abbreviation',
  color: '$level.strings.color',
  weight: '$level.numbers.weight',
};

/**
 * @constant
 * @name PARTY_BASE_AREA_PROJECTION
 * @description Party area fields passed to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.2.0
 * @version 0.1.0
 */
export const PARTY_BASE_AREA_PROJECTION = {
  _id: 1,
  namespace: 1,
  name: '$area.strings.name',
  abbreviation: '$area.strings.abbreviation',
  color: '$area.strings.color',
  weight: '$area.numbers.weight', // TODO: ensure from level
};

/**
 * @constant
 * @name PARTY_BASE_GROUP_PROJECTION
 * @description Party group fields passed to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.2.0
 * @version 0.1.0
 */
export const PARTY_BASE_GROUP_PROJECTION = {
  _id: 1,
  namespace: 1,
  name: '$group.strings.name',
  abbreviation: '$group.strings.abbreviation',
  color: '$group.strings.color',
  weight: '$group.numbers.weight',
};

/**
 * @constant
 * @name PARTY_BASE_ROLE_PROJECTION
 * @description Party role fields passed to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.2.0
 * @version 0.1.0
 */
export const PARTY_BASE_ROLE_PROJECTION = {
  _id: 1,
  namespace: 1,
  name: '$role.strings.name',
  abbreviation: '$role.strings.abbreviation',
  color: '$role.strings.color',
  weight: '$role.numbers.weight',
};

/**
 * @constant
 * @name PARTY_BASE_PROJECTION
 * @description Party fields passed to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.2.0
 * @version 0.1.0
 */
export const PARTY_BASE_PROJECTION = {
  _id: 1,
  type: 1,
  createdAt: 1,
  updatedAt: 1,
  metrics: 1,
  level: PARTY_BASE_LEVEL_PROJECTION,
  area: PARTY_BASE_AREA_PROJECTION,
  group: PARTY_BASE_GROUP_PROJECTION,
  role: PARTY_BASE_ROLE_PROJECTION,
};

// start: facets
// order: base, overall to specific

/**
 * @constant
 * @name PARTY_FACET_OVERVIEW
 * @description Party overview facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.2.0
 * @version 0.1.0
 */
export const PARTY_FACET_OVERVIEW = {
  overview: [
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        agency: { $sum: '$metrics.agency' },
        focal: { $sum: '$metrics.focal' },
        level: { $sum: '$metrics.level' },
        area: { $sum: '$metrics.area' },
        group: { $sum: '$metrics.group' },
        role: { $sum: '$metrics.role' },
        active: { $sum: '$metrics.active' },
        inactive: { $sum: '$metrics.inactive' },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ],
};

// start: aggregations
// order: base to specific

/**
 * @function getPartyBaseAggregation
 * @name getPartyBaseAggregation
 * @description Create base `Party` aggregations with all fields looked up and
 * un-winded for further stages in the pipeline.
 * @param {object} [criteria={}] conditions which will be applied in first
 * aggregation stage.
 * @returns {object|Error} valid base aggregation for party or error
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.2.0
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
  base.addFields(PARTY_BASE_METRIC_FIELDS);

  // add base projection
  base.project(PARTY_BASE_PROJECTION);

  // return party base aggregation
  return base;
};

/**
 * @function getPartyAnalysis
 * @name getPartyAnalysis
 * @description Create `Party` analysis.
 * @param {object} [criteria={}] conditions which will be applied in analysis
 * @param {Function} done callback to invoke on success or error
 * @returns {object|Error} valid party analysis or error
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.2.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * getPartyAnalysis({ ... });
 * //=> { data: { overview: { ... } }, ... }
 *
 */
export const getPartyAnalysis = (criteria, done) => {
  // normalize arguments
  const filter = isFunction(criteria) ? {} : criteria;
  const cb = isFunction(criteria) ? criteria : done;

  // obtain party base aggregation
  const base = getPartyBaseAggregation(filter);

  // add facets
  base.facet(PARTY_FACET_OVERVIEW);

  // run aggregation
  const aggregate = (next) => base.exec(next);
  const normalize = (result, next) => {
    // TODO: extract to utils
    const data = merge(...result);
    data.overview = merge(...data.overview);
    return next(null, { data });
  };
  const tasks = [aggregate, normalize];

  // return
  return waterfall(tasks, cb);
};

import {
  PREDEFINE_NAMESPACE_ADMINISTRATIVEAREA,
  PREDEFINE_NAMESPACE_EVENTGROUP,
  PREDEFINE_NAMESPACE_EVENTTYPE,
  PREDEFINE_NAMESPACE_EVENTLEVEL,
  PREDEFINE_NAMESPACE_EVENTSEVERITY,
  PREDEFINE_NAMESPACE_EVENTCERTAINTY,
  PREDEFINE_NAMESPACE_EVENTSTATUS,
  PREDEFINE_NAMESPACE_EVENTURGENCY,
  PREDEFINE_NAMESPACE_EVENTRESPONSE,
} from '@codetanzania/ewea-internals';
import { isFunction } from 'lodash';
import { waterfall } from 'async';
import { safeMergeObjects } from '@lykmapipo/common';
import { DEFAULT_PREDEFINE_RELATION } from '@codetanzania/ewea-common';
import { Event } from '@codetanzania/ewea-event';

// start: constants
// order: base to specific

const EVENT_STAGE_ALERT = 'Alert';
const EVENT_AGGREGATION_EXCLUDE = ['agencies', 'agency', 'focals', 'focal'];
const DEFAULT_RELATION_GROUP = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
  namespace: PREDEFINE_NAMESPACE_EVENTGROUP,
});
const DEFAULT_RELATION_TYPE = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
  namespace: PREDEFINE_NAMESPACE_EVENTTYPE,
});
const DEFAULT_RELATION_LEVEL = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
  namespace: PREDEFINE_NAMESPACE_EVENTLEVEL,
});
const DEFAULT_RELATION_SEVERITY = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
  namespace: PREDEFINE_NAMESPACE_EVENTSEVERITY,
});
const DEFAULT_RELATION_CERTAINTY = safeMergeObjects(
  DEFAULT_PREDEFINE_RELATION,
  {
    namespace: PREDEFINE_NAMESPACE_EVENTCERTAINTY,
  }
);
const DEFAULT_RELATION_STATUS = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
  namespace: PREDEFINE_NAMESPACE_EVENTSTATUS,
});
const DEFAULT_RELATION_URGENCY = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
  namespace: PREDEFINE_NAMESPACE_EVENTURGENCY,
});
const DEFAULT_RELATION_RESPONSE = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
  namespace: PREDEFINE_NAMESPACE_EVENTRESPONSE,
});
const DEFAULT_RELATION_AREA = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
  namespace: PREDEFINE_NAMESPACE_ADMINISTRATIVEAREA,
});

// start: extra metric fields
// order: base to specific

/**
 * @constant
 * @name EVENT_BASE_METRIC_FIELDS
 * @description Adds new metric fields to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_BASE_METRIC_FIELDS = {
  metrics: {
    alert: {
      $cond: { if: { $eq: ['$type', EVENT_STAGE_ALERT] }, then: 1, else: 0 },
    },
    event: {
      $cond: { if: { $ne: ['$type', EVENT_STAGE_ALERT] }, then: 1, else: 0 },
    },
    group: {
      $cond: { if: { $not: '$group' }, then: 0, else: 1 },
    },
    type: {
      $cond: { if: { $not: '$type' }, then: 0, else: 1 },
    },
    level: {
      $cond: { if: { $not: '$level' }, then: 0, else: 1 },
    },
    severity: {
      $cond: { if: { $not: '$severity' }, then: 0, else: 1 },
    },
    certainty: {
      $cond: { if: { $not: '$certainty' }, then: 0, else: 1 },
    },
    status: {
      $cond: { if: { $not: '$status' }, then: 0, else: 1 },
    },
    urgency: {
      $cond: { if: { $not: '$urgency' }, then: 0, else: 1 },
    },
    response: {
      $cond: { if: { $not: '$response' }, then: 0, else: 1 },
    },
    area: {
      $cond: { if: { $not: '$area' }, then: 0, else: 1 },
    },
    active: {
      $cond: { if: { $not: '$endedAt' }, then: 1, else: 0 },
    },
    ended: {
      $cond: { if: { $not: '$endedAt' }, then: 0, else: 1 },
    },
    durationTime: { $subtract: [new Date(), '$createdAt'] },
  },
};

// start: projections
// order: base to specific

/**
 * @constant
 * @name EVENT_BASE_GROUP_PROJECTION
 * @description Event group fields passed to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_BASE_GROUP_PROJECTION = {
  _id: 1,
  namespace: 1,
  name: '$group.strings.name',
  abbreviation: '$group.strings.abbreviation',
  color: '$group.strings.color',
  weight: '$group.numbers.weight',
};

/**
 * @constant
 * @name EVENT_BASE_TYPE_PROJECTION
 * @description Event type fields passed to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_BASE_TYPE_PROJECTION = {
  _id: 1,
  namespace: 1,
  name: '$type.strings.name',
  abbreviation: '$type.strings.abbreviation',
  color: '$type.strings.color',
  weight: '$type.numbers.weight',
};

/**
 * @constant
 * @name EVENT_BASE_LEVEL_PROJECTION
 * @description Event level fields passed to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_BASE_LEVEL_PROJECTION = {
  _id: 1,
  namespace: 1,
  name: '$level.strings.name',
  abbreviation: '$level.strings.abbreviation',
  color: '$level.strings.color',
  weight: '$level.numbers.weight',
};

/**
 * @constant
 * @name EVENT_BASE_SEVERITY_PROJECTION
 * @description Event severity fields passed to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_BASE_SEVERITY_PROJECTION = {
  _id: 1,
  namespace: 1,
  name: '$severity.strings.name',
  abbreviation: '$severity.strings.abbreviation',
  color: '$severity.strings.color',
  weight: '$severity.numbers.weight',
};

/**
 * @constant
 * @name EVENT_BASE_CERTAINTY_PROJECTION
 * @description Event certainty fields passed to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_BASE_CERTAINTY_PROJECTION = {
  _id: 1,
  namespace: 1,
  name: '$certainty.strings.name',
  abbreviation: '$certainty.strings.abbreviation',
  color: '$certainty.strings.color',
  weight: '$certainty.numbers.weight',
};

/**
 * @constant
 * @name EVENT_BASE_STATUS_PROJECTION
 * @description Event status fields passed to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_BASE_STATUS_PROJECTION = {
  _id: 1,
  namespace: 1,
  name: '$status.strings.name',
  abbreviation: '$status.strings.abbreviation',
  color: '$status.strings.color',
  weight: '$status.numbers.weight',
};

/**
 * @constant
 * @name EVENT_BASE_URGENCY_PROJECTION
 * @description Event urgency fields passed to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_BASE_URGENCY_PROJECTION = {
  _id: 1,
  namespace: 1,
  name: '$urgency.strings.name',
  abbreviation: '$urgency.strings.abbreviation',
  color: '$urgency.strings.color',
  weight: '$urgency.numbers.weight',
};

/**
 * @constant
 * @name EVENT_BASE_RESPONSE_PROJECTION
 * @description Event response fields passed to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_BASE_RESPONSE_PROJECTION = {
  _id: 1,
  namespace: 1,
  name: '$response.strings.name',
  abbreviation: '$response.strings.abbreviation',
  color: '$response.strings.color',
  weight: '$response.numbers.weight',
};

/**
 * @constant
 * @name EVENT_BASE_AREA_PROJECTION
 * @description Event area fields passed to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_BASE_AREA_PROJECTION = {
  _id: 1,
  namespace: 1,
  name: '$area.strings.name',
  abbreviation: '$area.strings.abbreviation',
  color: '$area.strings.color',
  weight: '$area.numbers.weight',
};

/**
 * @constant
 * @name EVENT_DEFAULT_PROJECTION
 * @description Normalize Event fields with defaults before pass to
 * the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_DEFAULT_PROJECTION = {
  _id: 1,
  stage: 1,
  createdAt: 1,
  updatedAt: 1,
  endedAt: 1,
  metrics: 1,
  group: { $ifNull: ['$group', DEFAULT_RELATION_GROUP] },
  type: { $ifNull: ['$type', DEFAULT_RELATION_TYPE] },
  level: { $ifNull: ['$level', DEFAULT_RELATION_LEVEL] },
  severity: { $ifNull: ['$severity', DEFAULT_RELATION_SEVERITY] },
  certainty: { $ifNull: ['$certainty', DEFAULT_RELATION_CERTAINTY] },
  status: { $ifNull: ['$status', DEFAULT_RELATION_STATUS] },
  urgency: { $ifNull: ['$urgency', DEFAULT_RELATION_URGENCY] },
  response: { $ifNull: ['$response', DEFAULT_RELATION_RESPONSE] },
  area: { $ifNull: ['$area', DEFAULT_RELATION_AREA] },
};

/**
 * @constant
 * @name EVENT_BASE_PROJECTION
 * @description Event fields passed to the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_BASE_PROJECTION = {
  _id: 1,
  stage: 1,
  createdAt: 1,
  updatedAt: 1,
  endedAt: 1,
  metrics: 1,
  group: EVENT_BASE_GROUP_PROJECTION,
  type: EVENT_BASE_TYPE_PROJECTION,
  level: EVENT_BASE_LEVEL_PROJECTION,
  severity: EVENT_BASE_SEVERITY_PROJECTION,
  certainty: EVENT_BASE_CERTAINTY_PROJECTION,
  status: EVENT_BASE_STATUS_PROJECTION,
  urgency: EVENT_BASE_URGENCY_PROJECTION,
  response: EVENT_BASE_RESPONSE_PROJECTION,
  area: EVENT_BASE_AREA_PROJECTION,
};

// start: facets
// order: base, overall to specific

/**
 * @constant
 * @name EVENT_FACET_OVERVIEW
 * @description General `Event` overview facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_FACET_OVERVIEW = {
  overview: [
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        alert: { $sum: '$metrics.alert' },
        event: { $sum: '$metrics.event' },
        active: { $sum: '$metrics.active' },
        ended: { $sum: '$metrics.ended' },
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
 * @name EVENT_FACET_OVERALL_GROUP
 * @description Overall `Event` breakdown by group facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_FACET_OVERALL_GROUP = {
  groups: [
    {
      $group: {
        _id: '$group._id',
        total: { $sum: 1 },
        alert: { $sum: '$metrics.alert' },
        event: { $sum: '$metrics.event' },
        active: { $sum: '$metrics.active' },
        ended: { $sum: '$metrics.ended' },
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
 * @name EVENT_FACET_OVERALL_TYPE
 * @description Overall `Event` breakdown by type facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_FACET_OVERALL_TYPE = {
  types: [
    {
      $group: {
        _id: '$type._id',
        total: { $sum: 1 },
        alert: { $sum: '$metrics.alert' },
        event: { $sum: '$metrics.event' },
        active: { $sum: '$metrics.active' },
        ended: { $sum: '$metrics.ended' },
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

/**
 * @constant
 * @name EVENT_FACET_OVERALL_LEVEL
 * @description Overall `Event` breakdown by level facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_FACET_OVERALL_LEVEL = {
  levels: [
    {
      $group: {
        _id: '$level._id',
        total: { $sum: 1 },
        alert: { $sum: '$metrics.alert' },
        event: { $sum: '$metrics.event' },
        active: { $sum: '$metrics.active' },
        ended: { $sum: '$metrics.ended' },
        namespace: { $first: '$level.namespace' },
        name: { $first: '$level.name' },
        abbreviation: { $first: '$level.abbreviation' },
        color: { $first: '$level.color' },
        weight: { $first: '$level.weight' },
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
 * @name EVENT_FACET_OVERALL_SEVERITY
 * @description Overall `Event` breakdown by severity facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_FACET_OVERALL_SEVERITY = {
  severities: [
    {
      $group: {
        _id: '$severity._id',
        total: { $sum: 1 },
        alert: { $sum: '$metrics.alert' },
        event: { $sum: '$metrics.event' },
        active: { $sum: '$metrics.active' },
        ended: { $sum: '$metrics.ended' },
        namespace: { $first: '$severity.namespace' },
        name: { $first: '$severity.name' },
        abbreviation: { $first: '$severity.abbreviation' },
        color: { $first: '$severity.color' },
        weight: { $first: '$severity.weight' },
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
 * @name EVENT_FACET_OVERALL_CERTAINTY
 * @description Overall `Event` breakdown by certainty facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_FACET_OVERALL_CERTAINTY = {
  certainties: [
    {
      $group: {
        _id: '$certainty._id',
        total: { $sum: 1 },
        alert: { $sum: '$metrics.alert' },
        event: { $sum: '$metrics.event' },
        active: { $sum: '$metrics.active' },
        ended: { $sum: '$metrics.ended' },
        namespace: { $first: '$certainty.namespace' },
        name: { $first: '$certainty.name' },
        abbreviation: { $first: '$certainty.abbreviation' },
        color: { $first: '$certainty.color' },
        weight: { $first: '$certainty.weight' },
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
 * @name EVENT_FACET_OVERALL_STATUS
 * @description Overall `Event` breakdown by status facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_FACET_OVERALL_STATUS = {
  statuses: [
    {
      $group: {
        _id: '$status._id',
        total: { $sum: 1 },
        alert: { $sum: '$metrics.alert' },
        event: { $sum: '$metrics.event' },
        active: { $sum: '$metrics.active' },
        ended: { $sum: '$metrics.ended' },
        namespace: { $first: '$status.namespace' },
        name: { $first: '$status.name' },
        abbreviation: { $first: '$status.abbreviation' },
        color: { $first: '$status.color' },
        weight: { $first: '$status.weight' },
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
 * @name EVENT_FACET_OVERALL_URGENCY
 * @description Overall `Event` breakdown by urgency facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_FACET_OVERALL_URGENCY = {
  urgencies: [
    {
      $group: {
        _id: '$urgency._id',
        total: { $sum: 1 },
        alert: { $sum: '$metrics.alert' },
        event: { $sum: '$metrics.event' },
        active: { $sum: '$metrics.active' },
        ended: { $sum: '$metrics.ended' },
        namespace: { $first: '$urgency.namespace' },
        name: { $first: '$urgency.name' },
        abbreviation: { $first: '$urgency.abbreviation' },
        color: { $first: '$urgency.color' },
        weight: { $first: '$urgency.weight' },
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
 * @name EVENT_FACET_OVERALL_RESPONSE
 * @description Overall `Event` breakdown by response facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_FACET_OVERALL_RESPONSE = {
  responses: [
    {
      $group: {
        _id: '$response._id',
        total: { $sum: 1 },
        alert: { $sum: '$metrics.alert' },
        event: { $sum: '$metrics.event' },
        active: { $sum: '$metrics.active' },
        ended: { $sum: '$metrics.ended' },
        namespace: { $first: '$response.namespace' },
        name: { $first: '$response.name' },
        abbreviation: { $first: '$response.abbreviation' },
        color: { $first: '$response.color' },
        weight: { $first: '$response.weight' },
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
 * @name EVENT_FACET_OVERALL_AREA
 * @description Overall `Event` breakdown by area facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 */
export const EVENT_FACET_OVERALL_AREA = {
  areas: [
    {
      $group: {
        _id: '$area._id',
        total: { $sum: 1 },
        alert: { $sum: '$metrics.alert' },
        event: { $sum: '$metrics.event' },
        active: { $sum: '$metrics.active' },
        ended: { $sum: '$metrics.ended' },
        namespace: { $first: '$area.namespace' },
        name: { $first: '$area.name' },
        abbreviation: { $first: '$area.abbreviation' },
        color: { $first: '$area.color' },
        weight: { $first: '$area.weight' },
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
  // TODO: ignore agencies & focals unwind

  // initialize event base aggregation
  const options = { exclude: EVENT_AGGREGATION_EXCLUDE };
  const base = Event.lookup(criteria, options);

  // project default on relations
  base.project(EVENT_DEFAULT_PROJECTION);

  // add base projection
  base.project(EVENT_BASE_PROJECTION);

  // TODO: project per relations before add metrics

  // add extra metric fields
  base.addFields(EVENT_BASE_METRIC_FIELDS);

  // return event base aggregation
  return base;
};

/**
 * @function getEventOverview
 * @name getEventOverview
 * @description Create `Event` overview analysis.
 * @param {object} [criteria={}] conditions which will be applied in analysis
 * @param {Function} done callback to invoke on success or error
 * @returns {object|Error} valid event overview analysis or error
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * getEventOverview({ ... });
 * //=> { total: 7, ... }
 *
 */
export const getEventOverview = (criteria, done) => {
  // normalize arguments
  const filter = isFunction(criteria) ? {} : criteria;
  const cb = isFunction(criteria) ? criteria : done;

  // obtain event base aggregation
  const base = getEventBaseAggregation(filter);

  // add facets
  const facets = {
    ...EVENT_FACET_OVERVIEW,
  };
  base.facet(facets);

  // run aggregation
  const aggregate = (next) => base.exec(next);
  const normalize = (result, next) => {
    // ensure data
    const { overview } = safeMergeObjects(...result);

    // normalize result
    const data = safeMergeObjects(...overview);

    // return normalize result
    return next(null, data);
  };

  // return
  const tasks = [aggregate, normalize];
  return waterfall(tasks, cb);
};

/**
 * @function getEventAnalysis
 * @name getEventAnalysis
 * @description Create `Event` analysis.
 * @param {object} [criteria={}] conditions which will be applied in analysis
 * @param {Function} done callback to invoke on success or error
 * @returns {object|Error} valid event analysis or error
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * getEventAnalysis({ ... });
 * //=> { data: { overview: { ... } }, ... }
 *
 */
export const getEventAnalysis = (criteria, done) => {
  // normalize arguments
  const filter = isFunction(criteria) ? {} : criteria;
  const cb = isFunction(criteria) ? criteria : done;

  // obtain event base aggregation
  const base = getEventBaseAggregation(filter);

  // add facets
  const facets = {
    ...EVENT_FACET_OVERVIEW,
    ...EVENT_FACET_OVERALL_GROUP,
    ...EVENT_FACET_OVERALL_TYPE,
    ...EVENT_FACET_OVERALL_LEVEL,
    ...EVENT_FACET_OVERALL_SEVERITY,
    ...EVENT_FACET_OVERALL_CERTAINTY,
    ...EVENT_FACET_OVERALL_STATUS,
    ...EVENT_FACET_OVERALL_URGENCY,
    ...EVENT_FACET_OVERALL_RESPONSE,
    ...EVENT_FACET_OVERALL_AREA,
  };
  base.facet(facets);

  // run aggregation
  const aggregate = (next) => base.exec(next);
  const normalize = (result, next) => {
    // TODO: extract to utils

    // ensure data
    const {
      overview,
      groups,
      types,
      levels,
      severities,
      certainties,
      statuses,
      urgencies,
      responses,
      areas,
    } = safeMergeObjects(...result);

    // normalize result
    const data = safeMergeObjects({
      overview: safeMergeObjects(...overview),
      overall: {
        groups,
        types,
        levels,
        severities,
        certainties,
        statuses,
        urgencies,
        responses,
        areas,
      },
    });

    // return normalize result
    return next(null, { data });
  };

  // return
  const tasks = [aggregate, normalize];
  return waterfall(tasks, cb);
};

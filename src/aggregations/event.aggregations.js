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
// import { isFunction } from 'lodash';
// import { waterfall } from 'async';
import { safeMergeObjects } from '@lykmapipo/common';
import { DEFAULT_PREDEFINE_RELATION } from '@codetanzania/ewea-common';
import { Event } from '@codetanzania/ewea-event';

// start: constants
// order: base to specific

const EVENT_STAGE_ALERT = 'Alert';
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
  const base = Event.lookup(criteria);

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

import { PREDEFINE_NAMESPACE_ADMINISTRATIVELEVEL, PREDEFINE_NAMESPACE_ADMINISTRATIVEAREA, PREDEFINE_NAMESPACE_PARTYGROUP, PREDEFINE_NAMESPACE_PARTYROLE, PREDEFINE_NAMESPACE_EVENTGROUP, PREDEFINE_NAMESPACE_EVENTTYPE, PREDEFINE_NAMESPACE_EVENTLEVEL, PREDEFINE_NAMESPACE_EVENTSEVERITY, PREDEFINE_NAMESPACE_EVENTCERTAINTY, PREDEFINE_NAMESPACE_EVENTSTATUS, PREDEFINE_NAMESPACE_EVENTURGENCY, PREDEFINE_NAMESPACE_EVENTRESPONSE } from '@codetanzania/ewea-internals';
import { safeMergeObjects, parseMs, pkg } from '@lykmapipo/common';
import { getString, apiVersion as apiVersion$1 } from '@lykmapipo/env';
import { connect } from '@lykmapipo/mongoose-common';
import { mount } from '@lykmapipo/express-common';
import { Router, start as start$1 } from '@lykmapipo/express-rest-actions';
import { createModels } from '@lykmapipo/file';
import { isFunction, slice, map, sortBy, uniqBy, mapValues, endsWith } from 'lodash';
import { waterfall, parallel } from 'async';
import { Party } from '@codetanzania/emis-stakeholder';
import { DEFAULT_PREDEFINE_RELATION } from '@codetanzania/ewea-common';
import { Event, EventChangeLog } from '@codetanzania/ewea-event';
import { Case } from '@codetanzania/ewea-case';
import { VehicleDispatch } from '@codetanzania/ewea-dispatch';
import { Predefine } from '@lykmapipo/predefine';

// start: constants
// order: base to specific

const PARTY_TYPE_FOCAL = 'Focal';
const DEFAULT_RELATION_LEVEL = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
  namespace: PREDEFINE_NAMESPACE_ADMINISTRATIVELEVEL,
});
const DEFAULT_RELATION_AREA = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
  namespace: PREDEFINE_NAMESPACE_ADMINISTRATIVEAREA,
});
const DEFAULT_RELATION_GROUP = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
  namespace: PREDEFINE_NAMESPACE_PARTYGROUP,
});
const DEFAULT_RELATION_ROLE = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
  namespace: PREDEFINE_NAMESPACE_PARTYROLE,
});

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
const PARTY_BASE_METRIC_FIELDS = {
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
const PARTY_BASE_LEVEL_PROJECTION = {
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
const PARTY_BASE_AREA_PROJECTION = {
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
const PARTY_BASE_GROUP_PROJECTION = {
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
const PARTY_BASE_ROLE_PROJECTION = {
  _id: 1,
  namespace: 1,
  name: '$role.strings.name',
  abbreviation: '$role.strings.abbreviation',
  color: '$role.strings.color',
  weight: '$role.numbers.weight',
};

/**
 * @constant
 * @name PARTY_DEFAULT_PROJECTION
 * @description Normalize Party fields with defaults before pass to
 * the next stage in the pipeline.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.3.0
 * @version 0.1.0
 */
const PARTY_DEFAULT_PROJECTION = {
  _id: 1,
  type: 1,
  createdAt: 1,
  updatedAt: 1,
  metrics: 1,
  level: { $ifNull: ['$level', DEFAULT_RELATION_LEVEL] },
  area: { $ifNull: ['$area', DEFAULT_RELATION_AREA] },
  group: { $ifNull: ['$group', DEFAULT_RELATION_GROUP] },
  role: { $ifNull: ['$role', DEFAULT_RELATION_ROLE] },
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
const PARTY_BASE_PROJECTION = {
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
 * @description General `Party` overview facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.2.0
 * @version 0.1.0
 */
const PARTY_FACET_OVERVIEW = {
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

/**
 * @constant
 * @name PARTY_FACET_OVERALL_LEVEL
 * @description Overall `Party` breakdown by administrative level facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.3.0
 * @version 0.1.0
 */
const PARTY_FACET_OVERALL_LEVEL = {
  levels: [
    {
      $group: {
        _id: '$level._id',
        total: { $sum: 1 },
        agency: { $sum: '$metrics.agency' },
        focal: { $sum: '$metrics.focal' },
        active: { $sum: '$metrics.active' },
        inactive: { $sum: '$metrics.inactive' },
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
 * @name PARTY_FACET_OVERALL_AREA
 * @description Overall `Party` breakdown by administrative area facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.3.0
 * @version 0.1.0
 */
const PARTY_FACET_OVERALL_AREA = {
  areas: [
    {
      $group: {
        _id: '$area._id',
        total: { $sum: 1 },
        agency: { $sum: '$metrics.agency' },
        focal: { $sum: '$metrics.focal' },
        active: { $sum: '$metrics.active' },
        inactive: { $sum: '$metrics.inactive' },
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

/**
 * @constant
 * @name PARTY_FACET_OVERALL_GROUP
 * @description Overall `Party` breakdown by group facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.3.0
 * @version 0.1.0
 */
const PARTY_FACET_OVERALL_GROUP = {
  groups: [
    {
      $group: {
        _id: '$group._id',
        total: { $sum: 1 },
        agency: { $sum: '$metrics.agency' },
        focal: { $sum: '$metrics.focal' },
        active: { $sum: '$metrics.active' },
        inactive: { $sum: '$metrics.inactive' },
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
 * @name PARTY_FACET_OVERALL_ROLE
 * @description Overall `Party` breakdown by role facet.
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.3.0
 * @version 0.1.0
 */
const PARTY_FACET_OVERALL_ROLE = {
  roles: [
    {
      $group: {
        _id: '$role._id',
        total: { $sum: 1 },
        agency: { $sum: '$metrics.agency' },
        focal: { $sum: '$metrics.focal' },
        active: { $sum: '$metrics.active' },
        inactive: { $sum: '$metrics.inactive' },
        namespace: { $first: '$role.namespace' },
        name: { $first: '$role.name' },
        abbreviation: { $first: '$role.abbreviation' },
        color: { $first: '$role.color' },
        weight: { $first: '$role.weight' },
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
const getPartyBaseAggregation = (criteria = {}) => {
  // initialize party base aggregation
  const base = Party.lookup(criteria);

  // project default on relations
  base.project(PARTY_DEFAULT_PROJECTION);

  // add base projection
  base.project(PARTY_BASE_PROJECTION);

  // TODO: project per relations before add metrics

  // add extra metric fields
  base.addFields(PARTY_BASE_METRIC_FIELDS);

  // return party base aggregation
  return base;
};

/**
 * @function getPartyOverview
 * @name getPartyOverview
 * @description Create `Party` overview analysis.
 * @param {object} [criteria={}] conditions which will be applied in analysis
 * @param {Function} done callback to invoke on success or error
 * @returns {object|Error} valid party overview analysis or error
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.4.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * getPartyOverview({ ... });
 * //=> { total: 7, ... }
 *
 */
const getPartyOverview = (criteria, done) => {
  // normalize arguments
  const filter = isFunction(criteria) ? {} : criteria;
  const cb = isFunction(criteria) ? criteria : done;

  // obtain party base aggregation
  const base = getPartyBaseAggregation(filter);

  // add facets
  const facets = {
    ...PARTY_FACET_OVERVIEW,
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
 * @version 0.2.0
 * @static
 * @public
 * @example
 *
 * getPartyAnalysis({ ... });
 * //=> { data: { overview: { ... } }, ... }
 *
 */
const getPartyAnalysis = (criteria, done) => {
  // normalize arguments
  const filter = isFunction(criteria) ? {} : criteria;
  const cb = isFunction(criteria) ? criteria : done;

  // obtain party base aggregation
  const base = getPartyBaseAggregation(filter);

  // add facets
  const facets = {
    ...PARTY_FACET_OVERVIEW,
    ...PARTY_FACET_OVERALL_LEVEL,
    ...PARTY_FACET_OVERALL_AREA,
    ...PARTY_FACET_OVERALL_GROUP,
    ...PARTY_FACET_OVERALL_ROLE,
  };
  base.facet(facets);

  // run aggregation
  const aggregate = (next) => base.exec(next);
  const normalize = (result, next) => {
    // TODO: extract to utils

    // ensure data
    const { overview, levels, areas, groups, roles } = safeMergeObjects(
      ...result
    );

    // normalize result
    const data = safeMergeObjects({
      overview: safeMergeObjects(...overview),
      overall: { levels, areas, groups, roles },
    });

    // return normalize result
    return next(null, { data });
  };

  // return
  const tasks = [aggregate, normalize];
  return waterfall(tasks, cb);
};

// TODO: dataset only aggregation; getPartyDatasets

// start: constants
// order: base to specific

const EVENT_STAGE_ALERT = 'Alert';
const EVENT_AGGREGATION_EXCLUDE = ['agencies', 'agency', 'focals', 'focal'];
const DEFAULT_RELATION_GROUP$1 = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
  namespace: PREDEFINE_NAMESPACE_EVENTGROUP,
});
const DEFAULT_RELATION_TYPE = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
  namespace: PREDEFINE_NAMESPACE_EVENTTYPE,
});
const DEFAULT_RELATION_LEVEL$1 = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
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
const DEFAULT_RELATION_AREA$1 = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
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
const EVENT_BASE_METRIC_FIELDS = {
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
const EVENT_BASE_GROUP_PROJECTION = {
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
const EVENT_BASE_TYPE_PROJECTION = {
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
const EVENT_BASE_LEVEL_PROJECTION = {
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
const EVENT_BASE_SEVERITY_PROJECTION = {
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
const EVENT_BASE_CERTAINTY_PROJECTION = {
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
const EVENT_BASE_STATUS_PROJECTION = {
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
const EVENT_BASE_URGENCY_PROJECTION = {
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
const EVENT_BASE_RESPONSE_PROJECTION = {
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
const EVENT_BASE_AREA_PROJECTION = {
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
const EVENT_DEFAULT_PROJECTION = {
  _id: 1,
  stage: 1,
  createdAt: 1,
  updatedAt: 1,
  endedAt: 1,
  metrics: 1,
  group: { $ifNull: ['$group', DEFAULT_RELATION_GROUP$1] },
  type: { $ifNull: ['$type', DEFAULT_RELATION_TYPE] },
  level: { $ifNull: ['$level', DEFAULT_RELATION_LEVEL$1] },
  severity: { $ifNull: ['$severity', DEFAULT_RELATION_SEVERITY] },
  certainty: { $ifNull: ['$certainty', DEFAULT_RELATION_CERTAINTY] },
  status: { $ifNull: ['$status', DEFAULT_RELATION_STATUS] },
  urgency: { $ifNull: ['$urgency', DEFAULT_RELATION_URGENCY] },
  response: { $ifNull: ['$response', DEFAULT_RELATION_RESPONSE] },
  area: { $ifNull: ['$area', DEFAULT_RELATION_AREA$1] },
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
const EVENT_BASE_PROJECTION = {
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
const EVENT_FACET_OVERVIEW = {
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
const EVENT_FACET_OVERALL_GROUP = {
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
const EVENT_FACET_OVERALL_TYPE = {
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
const EVENT_FACET_OVERALL_LEVEL = {
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
const EVENT_FACET_OVERALL_SEVERITY = {
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
const EVENT_FACET_OVERALL_CERTAINTY = {
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
const EVENT_FACET_OVERALL_STATUS = {
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
const EVENT_FACET_OVERALL_URGENCY = {
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
const EVENT_FACET_OVERALL_RESPONSE = {
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
const EVENT_FACET_OVERALL_AREA = {
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
const getEventBaseAggregation = (criteria = {}) => {
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
const getEventOverview = (criteria, done) => {
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
const getEventAnalysis = (criteria, done) => {
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

// start: constants
// order: base to specific

// Age groups lower boundaries i.e 0 - 9, 10 - 19, ...
const AGE_GROUPS_LOWER_BOUNDARIES = [
  0,
  10,
  20,
  30,
  40,
  50,
  60,
  70,
  80,
  90,
  100,
  110,
  120,
  130,
  140,
  150,
  160,
];

// generate all age groups from 0 to 159 years
// Remove the last range 160 - 169 since it is not included in $buckets
// shape returned values to have a common structure for all ranges
const NORMALIZED_AGE_GROUPS = slice(
  map(AGE_GROUPS_LOWER_BOUNDARIES, (lowerBoundary) => {
    const upperBoundary =
      lowerBoundary === 'Other' ? 'Other' : lowerBoundary + 9; // account for difference i.e 30 - 39
    return {
      total: 0,
      cases: [],
      lowerBoundary,
      upperBoundary,
    };
  }),
  0,
  AGE_GROUPS_LOWER_BOUNDARIES.length - 1
);

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
const CASE_BASE_METRIC_FIELDS = {};

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
 * @since 0.8.0
 * @version 0.1.0
 */
const CASE_DEFAULT_PROJECTION = {
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
 * @since 0.8.0
 * @version 0.1.0
 */
const CASE_BASE_PROJECTION = {
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
 * @since 0.8.0
 * @version 0.1.0
 */
const CASE_FACET_OVERVIEW = {};

/**
 * @constant
 * @name CASE_FACET_GENDER
 * @description Case Gender facet
 *
 * @author Benson Maruchu<benmaruchu@gmail.com>
 * @license MIT
 * @since 0.8.0
 * @version 0.1.0
 */
const CASE_FACET_GENDER = {
  gender: [
    {
      $group: {
        _id: '$victim.gender._id',
        total: { $sum: 1 },
        namespace: { $first: '$victim.gender.namespace' },
        name: { $first: '$victim.gender.strings.name' },
        weight: { $first: '$victim.gender.numbers.weight' },
        color: { $first: '$victim.gender.strings.color' },
      },
    },
    { $sort: { weight: 1 } },
  ],
};

/**
 * @constant
 * @name CASE_FACET_AGE_GROUPS
 * @description Case Age Groups facet
 *
 * @author Benson Maruchu<benmaruchu@gmail.com>
 * @license MIT
 * @since 0.8.0
 * @version 0.1.0
 */
const CASE_FACET_AGE_GROUPS = {
  ageGroups: [
    {
      $bucket: {
        groupBy: '$victim.age',
        boundaries: AGE_GROUPS_LOWER_BOUNDARIES,
        default: 'Other',
        output: {
          total: { $sum: 1 },
          cases: {
            $push: {
              _id: '$_id',
              number: '$number',
            },
          },
        },
      },
    },
    {
      $project: {
        lowerBoundary: '$_id',
        _id: 0,
        cases: 1,
        total: 1,
      },
    },
  ],
};

/**
 * @constant
 * @name CASE_FACET_OCCUPATIONS
 * @description Cases victim occupations facet
 *
 * @author Benson Maruchu<benmaruchu@gmail.com>
 * @license MIT
 * @since 0.8.0
 * @version 0.1.0
 */
const CASE_FACET_OCCUPATIONS = {
  occupations: [
    {
      $group: {
        _id: '$victim.occupation._id',
        total: { $sum: 1 },
        namespace: { $first: '$victim.occupation.namespace' },
        name: { $first: '$victim.occupation.strings.name' },
        weight: { $first: '$victim.occupation.numbers.weight' },
        color: { $first: '$victim.occupation.strings.color' },
      },
    },
  ],
};

/**
 * @constant
 * @name CASE_FACET_NATIONALITIES
 * @description Cases victim nationalities facet
 *
 * @author Benson Maruchu<benmaruchu@gmail.com>
 * @license MIT
 * @since 0.8.0
 * @version 0.1.0
 */
const CASE_FACET_NATIONALITIES = {
  nationalities: [
    {
      $group: {
        _id: '$victim.nationality._id',
        total: { $sum: 1 },
        namespace: { $first: '$victim.nationality.namespace' },
        name: { $first: '$victim.nationality.strings.name' },
        weight: { $first: '$victim.nationality.numbers.weight' },
        color: { $first: '$victim.nationality.strings.color' },
      },
    },
  ],
};

/**
 * @constant
 * @name CASE_FACET_STAGES
 * @description Case stages facet
 *
 * @author Benson Maruchu<benmaruchu@gmail.com>
 * @license MIT
 * @since 0.9.0
 * @version 0.1.0
 */
const CASE_FACET_STAGES = {
  stages: [
    {
      $group: {
        _id: '$stage._id',
        total: { $sum: 1 },
        namespace: { $first: '$stage.namespace' },
        name: { $first: '$stage.strings.name' },
        weight: { $first: '$stage.numbers.weight' },
        color: { $first: '$stage.strings.color' },
      },
    },
  ],
};

/**
 * @constant
 * @name CASE_FACET_SEVERITIES
 * @description Case severities facet
 *
 * @author Benson Maruchu<benmaruchu@gmail.com>
 * @license MIT
 * @since 0.9.0
 * @version 0.1.0
 */
const CASE_FACET_SEVERITIES = {
  severities: [
    {
      $group: {
        _id: '$severity._id',
        total: { $sum: 1 },
        namespace: { $first: '$severity.namespace' },
        name: { $first: '$severity.strings.name' },
        weight: { $first: '$severity.numbers.weight' },
        color: { $first: '$severity.strings.color' },
      },
    },
  ],
};

// start: aggregations
// order: base to specific

/**
 * @function getEventCaseAggregation
 * @name getEventCaseBaseAggregation
 * @description Create base aggregation for `Case` with all fields
 * looked up and un-winded for further aggregation operations.
 * @param {object} [criteria={}] conditions which will be applied in
 * first aggregation stage.
 * @returns {object} valid base aggregation for case.
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.8.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * getEventCaseAggregation({ ... });
 * //=> Aggregation{ ... }
 *
 */
const getEventCaseBaseAggregation = (criteria = {}) => {
  // TODO: ignore agencies & focals unwind

  // initialize case base aggregation
  const options = { exclude: CASE_AGGREGATION_EXCLUDE };
  const base = Case.lookup(criteria, options);

  // project default on relations
  // base.project(CASE_DEFAULT_PROJECTION);

  // add base projection
  // base.project(CASE_BASE_PROJECTION);

  // TODO: project per relations before add metrics

  // add extra metric fields
  // base.addFields(CASE_BASE_METRIC_FIELDS);

  // return case base aggregation
  return base;
};

/**
 * @function getEventCaseAnalysis
 * @name getEventCaseAnalysis
 * @description Create `Case` analysis.
 * @param {object} [criteria={}] conditions which will be applied in analysis
 * @param {Function} done callback to invoke on success or error
 * @returns {object|Error} valid event analysis or error
 *
 * @author Benson Maruchu <benmaruchu@gmail.com>
 * @license MIT
 * @since 0.8.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * getEventCaseAnalysis({ ... });
 * //=> { data: { overview: { ... } }, ... }
 *
 */
const getEventCaseAnalysis = (criteria, done) => {
  // normalize arguments
  const filter = isFunction(criteria) ? {} : criteria;
  const cb = isFunction(criteria) ? criteria : done;

  // cases base aggregation
  const base = getEventCaseBaseAggregation(filter);

  // add facets
  const facets = {
    ...CASE_FACET_GENDER,
    ...CASE_FACET_AGE_GROUPS,
    ...CASE_FACET_OCCUPATIONS,
    ...CASE_FACET_NATIONALITIES,
    ...CASE_FACET_SEVERITIES,
    ...CASE_FACET_STAGES,
  };

  base.facet(facets);

  const aggregate = (next) => base.exec(next);

  // Normalize data
  const normalize = (result, next) => {
    const {
      gender,
      ageGroups,
      occupations,
      nationalities,
      severities,
      stages,
    } = safeMergeObjects(...result);

    // add upper boundary for returned age groups
    const normalizedResultsAgeGroups = map(ageGroups, (group) => ({
      ...group,
      upperBoundary: group.lowerBoundary + 9,
    }));

    // merge all age groups
    const normalizedAgeGroups = sortBy(
      uniqBy(
        [...normalizedResultsAgeGroups, ...NORMALIZED_AGE_GROUPS],
        'lowerBoundary'
      ),
      'lowerBoundary'
    );

    const data = safeMergeObjects({
      overall: {
        gender,
        ageGroups: normalizedAgeGroups,
        occupations,
        nationalities,
        severities,
        stages,
      },
    });

    return next(null, { data });
  };

  const tasks = [aggregate, normalize];
  return waterfall(tasks, cb);
};

// TODO: extract utils
// TODO: limit exports

// start: constants
// order: base to specific

const DISPATCH_AGGREGATION_EXCLUDE = ['crew'];
const DEFAULT_RELATION_GROUP$2 = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
  namespace: PREDEFINE_NAMESPACE_EVENTGROUP,
});
const DEFAULT_RELATION_TYPE$1 = safeMergeObjects(DEFAULT_PREDEFINE_RELATION, {
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
const DISPATCH_BASE_METRIC_FIELDS = {
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
const DISPATCH_BASE_EVENTGROUP_PROJECTION = {
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
const DISPATCH_BASE_EVENTTYPE_PROJECTION = {
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
const DISPATCH_DEFAULT_PROJECTION = {
  _id: 1,
  createdAt: 1,
  dispatchedAt: 1,
  canceledAt: 1,
  resolvedAt: 1,
  metrics: 1,
  group: { $ifNull: ['$group', DEFAULT_RELATION_GROUP$2] },
  type: { $ifNull: ['$type', DEFAULT_RELATION_TYPE$1] },
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
const DISPATCH_BASE_PROJECTION = {
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
const DISPATCH_FACET_OVERVIEW = {
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
const DISPATCH_FACET_OVERALL_EVENTGROUP = {
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
const DISPATCH_FACET_OVERALL_EVENTTYPE = {
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
const getDispatchBaseAggregation = (criteria = {}) => {
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
const getDispatchOverview = (criteria, done) => {
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
const getDispatchAnalysis = (criteria, done) => {
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

const DEFAULT_OVERVIEW_ANALYSIS = {
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
const getOverviewAnalysis = (criteria, done) => {
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

/* constants */
const API_VERSION = getString('API_VERSION', '1.0.0');
const PATH_OVERVIEW = '/reports/overviews';
const PATH_INDICATORS = '/reports/indicators';
const PATH_RISKS = '/reports/risks';
const PATH_ACTIONS = '/reports/actions';
const PATH_NEEDS = '/reports/needs';
const PATH_EFFECTS = '/reports/effects';
const PATH_RESOURCES = '/reports/resources';
const PATH_PARTIES = '/reports/parties';
const PATH_ALERTS = '/reports/alerts';
const PATH_EVENTS = '/reports/events';
const PATH_DISPATCHES = '/reports/dispatches';
const PATH_CASES = '/reports/cases';

/**
 * @name ReportHttpRouter
 * @namespace ReportHttpRouter
 *
 * @description Common reports for EWEA
 *
 * @see {@link https://github.com/CodeTanzania/ewea}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 1.0.0
 * @public
 */
const router = new Router({
  version: API_VERSION,
});

/**
 * @name GetOverviewReport
 * @memberof ReportHttpRouter
 * @description Returns overview report
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 1.0.0
 * @public
 */
router.get(PATH_OVERVIEW, (request, response, next) => {
  return getOverviewAnalysis({}, (error, report) => {
    if (error) {
      return next(error);
    }
    return response.ok(report);
  });
});

/**
 * @name GetIndicatorReport
 * @memberof ReportHttpRouter
 * @description Returns indicators report
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 1.0.0
 * @public
 */
router.get(PATH_INDICATORS, (request, response) => {
  response.ok({});
});

/**
 * @name GetRiskReport
 * @memberof ReportHttpRouter
 * @description Returns risks report
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 1.0.0
 * @public
 */
router.get(PATH_RISKS, (request, response) => {
  response.ok({});
});

/**
 * @name GetActionReport
 * @memberof ReportHttpRouter
 * @description Returns actions report
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 1.0.0
 * @public
 */
router.get(PATH_ACTIONS, (request, response) => {
  response.ok({});
});

/**
 * @name GetNeedReport
 * @memberof ReportHttpRouter
 * @description Returns needs report
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 1.0.0
 * @public
 */
router.get(PATH_NEEDS, (request, response) => {
  response.ok({});
});

/**
 * @name GetEffectReport
 * @memberof ReportHttpRouter
 * @description Returns effects report
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 1.0.0
 * @public
 */
router.get(PATH_EFFECTS, (request, response) => {
  response.ok({});
});

/**
 * @name GetResourceReport
 * @memberof ReportHttpRouter
 * @description Returns resources report
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 1.0.0
 * @public
 */
router.get(PATH_RESOURCES, (request, response) => {
  response.ok({});
});

/**
 * @name GetPartyReport
 * @memberof ReportHttpRouter
 * @description Returns parties report
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 1.0.0
 * @public
 */
router.get(PATH_PARTIES, (request, response, next) => {
  return getPartyAnalysis({}, (error, report) => {
    if (error) {
      return next(error);
    }
    return response.ok(report);
  });
});

/**
 * @name GetAlertReport
 * @memberof ReportHttpRouter
 * @description Returns alerts report
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 1.0.0
 * @public
 */
router.get(PATH_ALERTS, (request, response) => {
  response.ok({});
});

/**
 * @name GetEventReport
 * @memberof ReportHttpRouter
 * @description Returns events report
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 1.0.0
 * @public
 */
router.get(PATH_EVENTS, (request, response, next) => {
  return getEventAnalysis({}, (error, report) => {
    if (error) {
      return next(error);
    }
    return response.ok(report);
  });
});

/**
 * @name GetDispatchReport
 * @memberof ReportHttpRouter
 * @description Returns dispatches report
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 1.0.0
 * @public
 */
router.get(PATH_DISPATCHES, (request, response, next) => {
  return getDispatchAnalysis({}, (error, report) => {
    if (error) {
      return next(error);
    }
    return response.ok(report);
  });
});

/**
 * @name GetCaseReport
 * @memberof ReportHttpRouter
 * @description Returns cases report
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 1.0.0
 * @public
 */
router.get(PATH_CASES, (request, response, next) => {
  return getEventCaseAnalysis({}, (error, report) => {
    if (error) {
      return next(error);
    }
    return response.ok(report);
  });
});

const CHANGELOG_FLAG_METRIC_FIELDS = {};

const CHANGELOG_TIME_METRIC_FIELDS = {};

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
const getChangeLogBaseAggregation = (criteria = {}) => {
  // initialize eventchangelog base aggregation
  const base = EventChangeLog.lookup(criteria);

  // add extra metric fields
  base.addFields(CHANGELOG_FLAG_METRIC_FIELDS);
  base.addFields(CHANGELOG_TIME_METRIC_FIELDS);

  // return eventchangelog base aggregation
  return base;
};

const PREDEFINE_FLAG_METRIC_FIELDS = {};

const PREDEFINE_TIME_METRIC_FIELDS = {};

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
const getPredefineBaseAggregation = (criteria = {}) => {
  // initialize predefine base aggregation
  const base = Predefine.lookup(criteria);

  // add extra metric fields
  base.addFields(PREDEFINE_FLAG_METRIC_FIELDS);
  base.addFields(PREDEFINE_TIME_METRIC_FIELDS);

  // return predefine base aggregation
  return base;
};

/**
 * @module Report
 * @name Report
 * @description Common reports for EWEA
 *
 * @see {@link https://github.com/CodeTanzania/ewea}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @license MIT
 * @example
 *
 * const { start } = require('@codetanzania/ewea-reports');
 *
 * start(error => { ... });
 *
 */

/**
 * @name info
 * @description package information
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @since 1.0.0
 * @version 0.1.0
 */
const info = pkg(
  `${__dirname}/package.json`,
  'name',
  'description',
  'version',
  'license',
  'homepage',
  'repository',
  'bugs',
  'sandbox',
  'contributors'
);

/**
 * @name apiVersion
 * @description http router api version
 * @type {string}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @since 0.1.0
 * @version 0.1.0
 */
const apiVersion = apiVersion$1();

/**
 * @function start
 * @name start
 * @description start http server
 * @param {Function} done callback to invoke on success or error
 * @author lally elias <lallyelias87@gmail.com>
 * @since 0.1.0
 * @version 0.1.0
 */
const start = (done) => {
  // connect mongodb
  connect((error) => {
    // back-off on connect error
    if (error) {
      return done(error);
    }

    // ensure file models
    createModels();

    // mount report router
    mount(router);

    // start http server
    return start$1(done);
  });
};

export { CASE_BASE_METRIC_FIELDS, CASE_BASE_PROJECTION, CASE_DEFAULT_PROJECTION, CASE_FACET_AGE_GROUPS, CASE_FACET_GENDER, CASE_FACET_NATIONALITIES, CASE_FACET_OCCUPATIONS, CASE_FACET_OVERVIEW, CASE_FACET_SEVERITIES, CASE_FACET_STAGES, CHANGELOG_FLAG_METRIC_FIELDS, CHANGELOG_TIME_METRIC_FIELDS, DEFAULT_OVERVIEW_ANALYSIS, DISPATCH_BASE_EVENTGROUP_PROJECTION, DISPATCH_BASE_EVENTTYPE_PROJECTION, DISPATCH_BASE_METRIC_FIELDS, DISPATCH_BASE_PROJECTION, DISPATCH_DEFAULT_PROJECTION, DISPATCH_FACET_OVERALL_EVENTGROUP, DISPATCH_FACET_OVERALL_EVENTTYPE, DISPATCH_FACET_OVERVIEW, EVENT_BASE_AREA_PROJECTION, EVENT_BASE_CERTAINTY_PROJECTION, EVENT_BASE_GROUP_PROJECTION, EVENT_BASE_LEVEL_PROJECTION, EVENT_BASE_METRIC_FIELDS, EVENT_BASE_PROJECTION, EVENT_BASE_RESPONSE_PROJECTION, EVENT_BASE_SEVERITY_PROJECTION, EVENT_BASE_STATUS_PROJECTION, EVENT_BASE_TYPE_PROJECTION, EVENT_BASE_URGENCY_PROJECTION, EVENT_DEFAULT_PROJECTION, EVENT_FACET_OVERALL_AREA, EVENT_FACET_OVERALL_CERTAINTY, EVENT_FACET_OVERALL_GROUP, EVENT_FACET_OVERALL_LEVEL, EVENT_FACET_OVERALL_RESPONSE, EVENT_FACET_OVERALL_SEVERITY, EVENT_FACET_OVERALL_STATUS, EVENT_FACET_OVERALL_TYPE, EVENT_FACET_OVERALL_URGENCY, EVENT_FACET_OVERVIEW, PARTY_BASE_AREA_PROJECTION, PARTY_BASE_GROUP_PROJECTION, PARTY_BASE_LEVEL_PROJECTION, PARTY_BASE_METRIC_FIELDS, PARTY_BASE_PROJECTION, PARTY_BASE_ROLE_PROJECTION, PARTY_DEFAULT_PROJECTION, PARTY_FACET_OVERALL_AREA, PARTY_FACET_OVERALL_GROUP, PARTY_FACET_OVERALL_LEVEL, PARTY_FACET_OVERALL_ROLE, PARTY_FACET_OVERVIEW, PREDEFINE_FLAG_METRIC_FIELDS, PREDEFINE_TIME_METRIC_FIELDS, apiVersion, getChangeLogBaseAggregation, getDispatchAnalysis, getDispatchBaseAggregation, getDispatchOverview, getEventAnalysis, getEventBaseAggregation, getEventCaseAnalysis, getEventCaseBaseAggregation, getEventOverview, getOverviewAnalysis, getPartyAnalysis, getPartyBaseAggregation, getPartyOverview, getPredefineBaseAggregation, info, router as reportRouter, start };

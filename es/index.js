import { PREDEFINE_NAMESPACE_ADMINISTRATIVELEVEL, PREDEFINE_NAMESPACE_ADMINISTRATIVEAREA, PREDEFINE_NAMESPACE_PARTYGROUP, PREDEFINE_NAMESPACE_PARTYROLE } from '@codetanzania/ewea-internals';
import { safeMergeObjects, pkg } from '@lykmapipo/common';
import { getString, apiVersion as apiVersion$1 } from '@lykmapipo/env';
import { connect } from '@lykmapipo/mongoose-common';
import { mount } from '@lykmapipo/express-common';
import { Router, start as start$1 } from '@lykmapipo/express-rest-actions';
import { createModels } from '@lykmapipo/file';
import { isFunction } from 'lodash';
import { waterfall, parallel } from 'async';
import { Party } from '@codetanzania/emis-stakeholder';
import { DEFAULT_PREDEFINE_RELATION } from '@codetanzania/ewea-common';
import { EventChangeLog, Event } from '@codetanzania/ewea-event';
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

const DEFAULT_OVERVIEW_ANALYSIS = {
  parties: { total: 0, agency: 0, focal: 0 },
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
  const tasks = { parties };

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
router.get(PATH_EVENTS, (request, response) => {
  response.ok({
    overview: { total: 14, active: 9, ended: 5 },
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
router.get(PATH_DISPATCHES, (request, response) => {
  response.ok({});
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
router.get(PATH_CASES, (request, response) => {
  response.ok({});
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

const EVENT_FLAG_METRIC_FIELDS = {
  active: {
    $cond: { if: { $not: '$endedAt' }, then: 1, else: 0 },
  },
  ended: {
    $cond: { if: { $not: '$endedAt' }, then: 0, else: 1 },
  },
};

const EVENT_TIME_METRIC_FIELDS = {
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
const getEventBaseAggregation = (criteria = {}) => {
  // initialize event base aggregation
  const base = Event.lookup(criteria);

  // add extra metric fields
  base.addFields(EVENT_FLAG_METRIC_FIELDS);
  base.addFields(EVENT_TIME_METRIC_FIELDS);

  // return event base aggregation
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

export { CHANGELOG_FLAG_METRIC_FIELDS, CHANGELOG_TIME_METRIC_FIELDS, DEFAULT_OVERVIEW_ANALYSIS, EVENT_FLAG_METRIC_FIELDS, EVENT_TIME_METRIC_FIELDS, PARTY_BASE_AREA_PROJECTION, PARTY_BASE_GROUP_PROJECTION, PARTY_BASE_LEVEL_PROJECTION, PARTY_BASE_METRIC_FIELDS, PARTY_BASE_PROJECTION, PARTY_BASE_ROLE_PROJECTION, PARTY_DEFAULT_PROJECTION, PARTY_FACET_OVERALL_AREA, PARTY_FACET_OVERALL_GROUP, PARTY_FACET_OVERALL_LEVEL, PARTY_FACET_OVERALL_ROLE, PARTY_FACET_OVERVIEW, PREDEFINE_FLAG_METRIC_FIELDS, PREDEFINE_TIME_METRIC_FIELDS, apiVersion, getChangeLogBaseAggregation, getEventBaseAggregation, getOverviewAnalysis, getPartyAnalysis, getPartyBaseAggregation, getPartyOverview, getPredefineBaseAggregation, info, router as reportRouter, start };

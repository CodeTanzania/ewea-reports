import { Case } from '@codetanzania/ewea-case';
import { safeMergeObjects } from '@lykmapipo/common';
import { waterfall } from 'async';
import { map, isFunction, sortBy, uniqBy } from 'lodash';

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
];

// generate all age groups from 0 to 200 years
// For shaping returned value
const NORMALIZED_AGE_GROUPS = map(
  AGE_GROUPS_LOWER_BOUNDARIES,
  (lowerBoundary) => ({
    total: 0,
    cases: [],
    lowerBoundary,
    upperBoundary: lowerBoundary + 9, // account for difference i.e 30 - 39
  })
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
 * @since 0.8.0
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
 * @since 0.8.0
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
 * @since 0.8.0
 * @version 0.1.0
 */
export const CASE_FACET_OVERVIEW = {};

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
export const CASE_FACET_GENDER = {
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
export const CASE_FACET_AGE_GROUPS = {
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
export const CASE_FACET_OCCUPATIONS = {
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
export const CASE_FACET_NATIONALITIES = {
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
export const getEventCaseBaseAggregation = (criteria = {}) => {
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
export const getEventCaseAnalysis = (criteria, done) => {
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
  };

  base.facet(facets);

  const aggregate = (next) => base.exec(next);

  // Normalize data
  const normalize = (result, next) => {
    const { gender, ageGroups, occupations, nationalities } = safeMergeObjects(
      ...result
    );

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
      },
    });

    return next(null, { data });
  };

  const tasks = [aggregate, normalize];
  return waterfall(tasks, cb);
};

import { getString } from '@lykmapipo/env';
import { Router } from '@lykmapipo/express-rest-actions';

import { getPartyAnalysis } from './aggregations/party.aggregations';

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
router.get(PATH_OVERVIEW, (request, response) => {
  response.ok({});
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

/* expose report router */
export default router;

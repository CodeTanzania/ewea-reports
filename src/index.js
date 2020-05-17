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
import '@codetanzania/ewea-internals';
import { pkg } from '@lykmapipo/common';
import { apiVersion as httpApiVersion } from '@lykmapipo/env';
import { connect } from '@lykmapipo/mongoose-common';
import { mount } from '@lykmapipo/express-common';
import { start as startHttp } from '@lykmapipo/express-rest-actions';
import { createModels } from '@lykmapipo/file';
import reportRouter from './report.http.router';

export * from './aggregations/changelog.aggregations';
export * from './aggregations/event.aggregations';
export * from './aggregations/party.aggregations';
export * from './aggregations/dispatch.aggregations';
export * from './aggregations/predefine.aggregations';
export * from './aggregations/overview.aggregations';

/**
 * @name info
 * @description package information
 * @type {object}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @since 1.0.0
 * @version 0.1.0
 */
export const info = pkg(
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
 * @name reportRouter
 * @description report http router
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @since 0.1.0
 * @version 0.1.0
 */
export { reportRouter };

/**
 * @name apiVersion
 * @description http router api version
 * @type {string}
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @since 0.1.0
 * @version 0.1.0
 */
export const apiVersion = httpApiVersion();

/**
 * @function start
 * @name start
 * @description start http server
 * @param {Function} done callback to invoke on success or error
 * @author lally elias <lallyelias87@gmail.com>
 * @since 0.1.0
 * @version 0.1.0
 */
export const start = (done) => {
  // connect mongodb
  connect((error) => {
    // back-off on connect error
    if (error) {
      return done(error);
    }

    // ensure file models
    createModels();

    // mount report router
    mount(reportRouter);

    // start http server
    return startHttp(done);
  });
};

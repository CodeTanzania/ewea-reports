import {
  expect,
  // enableDebug
} from '@lykmapipo/mongoose-test-helpers';

import {
  getDispatchBaseAggregation,
  getDispatchOverview,
  getDispatchAnalysis,
} from '../../src';

import { dispatchOverview } from '../fixtures/expectations';

describe('Dispatch Aggregations', () => {
  it('should provide base aggregations', (done) => {
    getDispatchBaseAggregation().exec((error, report) => {
      expect(error).to.not.exist;
      expect(report).to.exist;
      done(error, report);
    });
  });

  it('should provide dispatch overview analysis', (done) => {
    getDispatchOverview((error, report) => {
      expect(error).to.not.exist;
      expect(report).to.exist.and.be.an('object');
      expect(report).to.be.eql(dispatchOverview);
      done(error, report);
    });
  });

  it('should provide dispatch analysis', (done) => {
    getDispatchAnalysis((error, report) => {
      expect(error).to.not.exist;
      expect(report).to.exist.and.be.an('object');
      expect(report.data).to.exist.and.be.an('object');
      expect(report.data.overview).to.be.eql(dispatchOverview);
      expect(report.data.overall.groups).to.exist.and.be.an('array');
      expect(report.data.overall.types).to.exist.and.be.an('array');
      done(error, report);
    });
  });
});

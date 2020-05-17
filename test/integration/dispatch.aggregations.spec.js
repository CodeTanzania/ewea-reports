import {
  expect,
  // enableDebug
} from '@lykmapipo/mongoose-test-helpers';

import {
  getDispatchBaseAggregation,
  getDispatchOverview,
  getDispatchAnalysis,
} from '../../src';

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
      expect(report).to.be.eql({
        total: 1,
        waiting: 0,
        dispatched: 1,
        canceled: 0,
        resolved: 1,
        minimumWaitTime: 120000,
        maximumWaitTime: 120000,
        averageWaitTime: 120000,
        minimumDispatchTime: 540000,
        maximumDispatchTime: 540000,
        averageDispatchTime: 540000,
        minimumCancelTime: null,
        maximumCancelTime: null,
        averageCancelTime: null,
        minimumResolveTime: 660000,
        maximumResolveTime: 660000,
        averageResolveTime: 660000,
      });
      done(error, report);
    });
  });

  it('should provide dispatch analysis', (done) => {
    getDispatchAnalysis((error, report) => {
      expect(error).to.not.exist;
      expect(report).to.exist.and.be.an('object');
      expect(report.data).to.exist.and.be.an('object');
      expect(report.data.overview).to.be.eql({
        total: 1,
        waiting: 0,
        dispatched: 1,
        canceled: 0,
        resolved: 1,
        minimumWaitTime: 120000,
        maximumWaitTime: 120000,
        averageWaitTime: 120000,
        minimumDispatchTime: 540000,
        maximumDispatchTime: 540000,
        averageDispatchTime: 540000,
        minimumCancelTime: null,
        maximumCancelTime: null,
        averageCancelTime: null,
        minimumResolveTime: 660000,
        maximumResolveTime: 660000,
        averageResolveTime: 660000,
      });
      expect(report.data.overall.groups).to.exist.and.be.an('array');
      expect(report.data.overall.types).to.exist.and.be.an('array');
      done(error, report);
    });
  });
});

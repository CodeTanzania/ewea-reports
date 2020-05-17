import {
  expect,
  // enableDebug
} from '@lykmapipo/mongoose-test-helpers';

import { getOverviewAnalysis } from '../../src';

describe('Overview Aggregations', () => {
  it('should provide overview analysis', (done) => {
    getOverviewAnalysis((error, report) => {
      expect(error).to.not.exist;
      expect(report).to.exist.and.be.an('object');
      expect(report.data).to.exist.and.be.an('object');
      expect(report.data.parties).to.be.eql({
        total: 6,
        agency: 2,
        focal: 4,
        level: 6, // FIX
        area: 6, // FIX
        group: 6, // FIX
        role: 6, // FIX
        active: 6,
        inactive: 0,
      });
      expect(report.data.events).to.be.eql({
        total: 1,
        alert: 0,
        event: 1,
        active: 0,
        ended: 1,
      });
      expect(report.data.dispatches).to.be.eql({
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
});

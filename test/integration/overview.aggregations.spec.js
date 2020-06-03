import {
  expect,
  // enableDebug
} from '@lykmapipo/mongoose-test-helpers';

import { getOverviewAnalysis } from '../../src';

import {
  partyOverview,
  eventOverview,
  dispatchOverview,
} from '../expectations';

describe('Overview Aggregations', () => {
  it('should provide overview analysis', (done) => {
    getOverviewAnalysis((error, report) => {
      expect(error).to.not.exist;
      expect(report).to.exist.and.be.an('object');
      expect(report.data).to.exist.and.be.an('object');
      expect(report.data.parties).to.be.eql(partyOverview);
      expect(report.data.events).to.be.eql(eventOverview);
      expect(report.data.dispatches).to.be.eql(dispatchOverview);
      done(error, report);
    });
  });
});

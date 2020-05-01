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
        total: 4,
        agency: 2,
        focal: 2,
        level: 4, // FIX
        area: 4, // FIX
        group: 4, // FIX
        role: 4, // FIX
        active: 4,
        inactive: 0,
      });
      expect(report.data.events).to.be.eql({
        total: 1,
        alert: 0,
        event: 1,
        active: 0,
        ended: 1,
      });
      done(error, report);
    });
  });
});

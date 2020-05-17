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
      done(error, report);
    });
  });
});

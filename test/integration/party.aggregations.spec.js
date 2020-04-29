import {
  expect,
  // enableDebug
} from '@lykmapipo/mongoose-test-helpers';

import { getPartyBaseAggregation, getPartyAnalysis } from '../../src';

describe('Party Aggregations', () => {
  it('should add extra metric fields', (done) => {
    getPartyBaseAggregation().exec((error, report) => {
      expect(error).to.not.exist;
      expect(report).to.exist;
      done(error, report);
    });
  });

  it('should execute overview facet', (done) => {
    getPartyAnalysis((error, report) => {
      expect(error).to.not.exist;
      expect(report).to.exist.and.be.an('object');
      expect(report.data).to.exist.and.be.an('object');
      expect(report.data.overview).to.be.eql({
        total: 4,
        agency: 2,
        focal: 2,
        level: 2,
        area: 2,
        group: 2,
        role: 2,
        active: 4,
        inactive: 0,
      });
      done(error, report);
    });
  });
});

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
        level: 4, // FIX
        area: 4, // FIX
        group: 4, // FIX
        role: 4, // FIX
        active: 4,
        inactive: 0,
      });
      expect(report.data.overall.levels).to.exist.and.be.an('array');
      expect(report.data.overall.areas).to.exist.and.be.an('array');
      expect(report.data.overall.groups).to.exist.and.be.an('array');
      expect(report.data.overall.roles).to.exist.and.be.an('array');
      done(error, report);
    });
  });
});

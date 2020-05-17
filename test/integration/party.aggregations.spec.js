import {
  expect,
  // enableDebug
} from '@lykmapipo/mongoose-test-helpers';

import {
  getPartyBaseAggregation,
  getPartyOverview,
  getPartyAnalysis,
} from '../../src';

describe('Party Aggregations', () => {
  it('should provide base aggregations', (done) => {
    getPartyBaseAggregation().exec((error, report) => {
      expect(error).to.not.exist;
      expect(report).to.exist;
      done(error, report);
    });
  });

  it('should provide party overview analysis', (done) => {
    getPartyOverview((error, report) => {
      expect(error).to.not.exist;
      expect(report).to.exist.and.be.an('object');
      expect(report).to.be.eql({
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
      done(error, report);
    });
  });

  it('should provide party analysis', (done) => {
    getPartyAnalysis((error, report) => {
      expect(error).to.not.exist;
      expect(report).to.exist.and.be.an('object');
      expect(report.data).to.exist.and.be.an('object');
      expect(report.data.overview).to.be.eql({
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
      expect(report.data.overall.levels).to.exist.and.be.an('array');
      expect(report.data.overall.areas).to.exist.and.be.an('array');
      expect(report.data.overall.groups).to.exist.and.be.an('array');
      expect(report.data.overall.roles).to.exist.and.be.an('array');
      done(error, report);
    });
  });
});

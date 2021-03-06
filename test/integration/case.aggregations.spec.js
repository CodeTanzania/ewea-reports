import {
  expect,
  // enableDebug
} from '@lykmapipo/mongoose-test-helpers';

import { getEventCaseBaseAggregation, getEventCaseAnalysis } from '../../src';

describe('EventCase Aggregations', () => {
  it('should provide base aggregations', (done) => {
    getEventCaseBaseAggregation().exec((error, report) => {
      expect(error).to.not.exist;
      expect(report).to.exist;
      done(error, report);
    });
  });

  it('should provide case analysis', (done) => {
    getEventCaseAnalysis((error, report) => {
      expect(error).to.not.exist;
      expect(report).to.exist.and.be.an('object');
      expect(report.data).to.exist.and.be.an('object');
      expect(report.data.overview).to.exist.and.be.an('object');
      expect(report.data.overall.gender).to.exist.and.be.an('array');
      expect(report.data.overall.ageGroups).to.exist.and.be.an('array');
      expect(report.data.overall.occupations).to.exist.and.be.an('array');
      expect(report.data.overall.nationalities).to.exist.and.be.an('array');
      expect(report.data.overall.severities).to.exist.and.be.an('array');
      expect(report.data.overall.stages).to.exist.and.be.an('array');
      expect(report.data.overall.ageGroups).to.have.lengthOf(16);
      done(error, report);
    });
  });
});

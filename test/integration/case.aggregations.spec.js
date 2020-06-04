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
      expect(report.data.overall.gender).to.exist.and.be.an('array');
      expect(report.data.overall.ageGroups).to.exist.and.be.an('array');
      expect(report.data.overall.ageGroups).to.have.lengthOf(21);
      done(error, report);
    });
  });
});

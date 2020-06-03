import {
  expect,
  // enableDebug
} from '@lykmapipo/mongoose-test-helpers';

import {
  getEventBaseAggregation,
  getEventOverview,
  getEventAnalysis,
} from '../../src';

import { eventOverview } from '../expectations';

describe('Event Aggregations', () => {
  it('should provide base aggregations', (done) => {
    getEventBaseAggregation().exec((error, report) => {
      expect(error).to.not.exist;
      expect(report).to.exist;
      done(error, report);
    });
  });

  it('should provide event overview analysis', (done) => {
    getEventOverview((error, report) => {
      expect(error).to.not.exist;
      expect(report).to.exist.and.be.an('object');
      expect(report).to.be.eql(eventOverview);
      done(error, report);
    });
  });

  it('should provide event analysis', (done) => {
    getEventAnalysis((error, report) => {
      expect(error).to.not.exist;
      expect(report).to.exist.and.be.an('object');
      expect(report.data).to.exist.and.be.an('object');
      expect(report.data.overview).to.be.eql(eventOverview);
      expect(report.data.overall.groups).to.exist.and.be.an('array');
      expect(report.data.overall.types).to.exist.and.be.an('array');
      expect(report.data.overall.levels).to.exist.and.be.an('array');
      expect(report.data.overall.severities).to.exist.and.be.an('array');
      expect(report.data.overall.certainties).to.exist.and.be.an('array');
      expect(report.data.overall.statuses).to.exist.and.be.an('array');
      expect(report.data.overall.urgencies).to.exist.and.be.an('array');
      expect(report.data.overall.responses).to.exist.and.be.an('array');
      expect(report.data.overall.areas).to.exist.and.be.an('array');
      done(error, report);
    });
  });
});

import {
  expect,
  // enableDebug
} from '@lykmapipo/mongoose-test-helpers';

import { getEventBaseAggregation } from '../../src';

describe('Event Aggregations', () => {
  it('should provide base aggregations', (done) => {
    getEventBaseAggregation().exec((error, report) => {
      expect(error).to.not.exist;
      expect(report).to.exist;
      done(error, report);
    });
  });
});

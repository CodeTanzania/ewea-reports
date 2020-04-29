import {
  expect,
  // enableDebug
} from '@lykmapipo/mongoose-test-helpers';

import { getPartyBaseAggregation } from '../../src';

describe('Party Aggregations', () => {
  it('should add extra metric fields', (done) => {
    // enableDebug();
    getPartyBaseAggregation().exec((error, found) => {
      expect(error).to.not.exist;
      expect(found).to.exist;
      done(error, found);
    });
  });
});

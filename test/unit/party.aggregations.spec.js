import { expect } from '@lykmapipo/test-helpers';

import {
  PARTY_FLAG_METRIC_FIELDS,
  PARTY_TIME_METRIC_FIELDS,
  getPartyBaseAggregation,
} from '../../src';

describe('Party Aggregations', () => {
  it('should have flag metric fields', () => {
    expect(PARTY_FLAG_METRIC_FIELDS).to.exist.and.be.an('object');
    expect(PARTY_FLAG_METRIC_FIELDS.active).to.exist.and.be.an('object');
  });

  it('should have time metric fields', () => {
    expect(PARTY_TIME_METRIC_FIELDS).to.exist.and.be.an('object');
    expect(PARTY_TIME_METRIC_FIELDS.activeTime).to.exist.and.be.an('object');
  });

  it('should expose base factory', () => {
    expect(getPartyBaseAggregation).to.exist.and.be.a('function');
  });
});

import { expect } from '@lykmapipo/test-helpers';

import { PARTY_BASE_METRIC_FIELDS, getPartyBaseAggregation } from '../../src';

describe('Party Aggregations', () => {
  it('should have flag metric fields', () => {
    expect(PARTY_BASE_METRIC_FIELDS).to.exist.and.be.an('object');
    expect(PARTY_BASE_METRIC_FIELDS.metrics).to.exist.and.be.an('object');
    expect(PARTY_BASE_METRIC_FIELDS.metrics.focal).to.exist.and.be.an('object');
    expect(PARTY_BASE_METRIC_FIELDS.metrics.agency).to.exist.and.be.an(
      'object'
    );
    expect(PARTY_BASE_METRIC_FIELDS.metrics.active).to.exist.and.be.an(
      'object'
    );
  });

  it('should expose base factory', () => {
    expect(getPartyBaseAggregation).to.exist.and.be.a('function');
  });
});

import { expect } from '@lykmapipo/test-helpers';

import {
  PARTY_BASE_METRIC_FIELDS,
  PARTY_BASE_LEVEL_PROJECTION,
  PARTY_BASE_AREA_PROJECTION,
  PARTY_BASE_GROUP_PROJECTION,
  PARTY_BASE_ROLE_PROJECTION,
  PARTY_BASE_PROJECTION,
  getPartyBaseAggregation,
} from '../../src';

describe('Party Aggregations', () => {
  it('should have base metric fields', () => {
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

  it('should have base level projection', () => {
    expect(PARTY_BASE_LEVEL_PROJECTION).to.exist.and.be.an('object');
  });

  it('should have base area projection', () => {
    expect(PARTY_BASE_AREA_PROJECTION).to.exist.and.be.an('object');
  });

  it('should have base group projection', () => {
    expect(PARTY_BASE_GROUP_PROJECTION).to.exist.and.be.an('object');
  });

  it('should have base role projection', () => {
    expect(PARTY_BASE_ROLE_PROJECTION).to.exist.and.be.an('object');
  });

  it('should have base projection', () => {
    expect(PARTY_BASE_PROJECTION).to.exist.and.be.an('object');
  });

  it('should expose base factory', () => {
    expect(getPartyBaseAggregation).to.exist.and.be.a('function');
  });
});

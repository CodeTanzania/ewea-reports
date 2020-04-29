import { expect } from '@lykmapipo/test-helpers';

import {
  PARTY_BASE_METRIC_FIELDS,
  PARTY_BASE_LEVEL_PROJECTION,
  PARTY_BASE_AREA_PROJECTION,
  PARTY_BASE_GROUP_PROJECTION,
  PARTY_BASE_ROLE_PROJECTION,
  PARTY_DEFAULT_PROJECTION,
  PARTY_BASE_PROJECTION,
  PARTY_FACET_OVERVIEW,
  PARTY_FACET_OVERALL_LEVEL,
  PARTY_FACET_OVERALL_AREA,
  PARTY_FACET_OVERALL_GROUP,
  PARTY_FACET_OVERALL_ROLE,
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
    expect(PARTY_BASE_METRIC_FIELDS.metrics.level).to.exist.and.be.an('object');
    expect(PARTY_BASE_METRIC_FIELDS.metrics.area).to.exist.and.be.an('object');
    expect(PARTY_BASE_METRIC_FIELDS.metrics.group).to.exist.and.be.an('object');
    expect(PARTY_BASE_METRIC_FIELDS.metrics.role).to.exist.and.be.an('object');
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

  it('should have default projection', () => {
    expect(PARTY_DEFAULT_PROJECTION).to.exist.and.be.an('object');
  });

  it('should have base projection', () => {
    expect(PARTY_BASE_PROJECTION).to.exist.and.be.an('object');
  });

  it('should have overview facet', () => {
    expect(PARTY_FACET_OVERVIEW).to.exist.and.be.an('object');
  });

  it('should have overall level facet', () => {
    expect(PARTY_FACET_OVERALL_LEVEL).to.exist.and.be.an('object');
  });

  it('should have overall area facet', () => {
    expect(PARTY_FACET_OVERALL_AREA).to.exist.and.be.an('object');
  });

  it('should have overall group facet', () => {
    expect(PARTY_FACET_OVERALL_GROUP).to.exist.and.be.an('object');
  });

  it('should have overall role facet', () => {
    expect(PARTY_FACET_OVERALL_ROLE).to.exist.and.be.an('object');
  });

  it('should expose base factory', () => {
    expect(getPartyBaseAggregation).to.exist.and.be.a('function');
  });
});

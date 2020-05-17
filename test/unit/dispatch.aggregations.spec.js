import { expect } from '@lykmapipo/test-helpers';

import {
  DISPATCH_BASE_METRIC_FIELDS,
  DISPATCH_BASE_EVENTGROUP_PROJECTION,
  DISPATCH_BASE_EVENTTYPE_PROJECTION,
  DISPATCH_FACET_OVERVIEW,
  DISPATCH_FACET_OVERALL_EVENTGROUP,
  DISPATCH_FACET_OVERALL_EVENTTYPE,
  getDispatchBaseAggregation,
} from '../../src';

describe('Dispatch Aggregations', () => {
  it('should have flag metric fields', () => {
    expect(DISPATCH_BASE_METRIC_FIELDS).to.exist.and.be.an('object');
    expect(DISPATCH_BASE_METRIC_FIELDS.metrics.waiting).to.exist.and.be.an(
      'object'
    );
    expect(DISPATCH_BASE_METRIC_FIELDS.metrics.dispatched).to.exist.and.be.an(
      'object'
    );
    expect(DISPATCH_BASE_METRIC_FIELDS.metrics.canceled).to.exist.and.be.an(
      'object'
    );
    expect(DISPATCH_BASE_METRIC_FIELDS.metrics.resolved).to.exist.and.be.an(
      'object'
    );
    expect(DISPATCH_BASE_METRIC_FIELDS.metrics.waitTime).to.exist.and.be.an(
      'object'
    );
    expect(DISPATCH_BASE_METRIC_FIELDS.metrics.dispatchTime).to.exist.and.be.an(
      'object'
    );
    expect(DISPATCH_BASE_METRIC_FIELDS.metrics.cancelTime).to.exist.and.be.an(
      'object'
    );
    expect(DISPATCH_BASE_METRIC_FIELDS.metrics.resolveTime).to.exist.and.be.an(
      'object'
    );
  });

  it('should have base group projection', () => {
    expect(DISPATCH_BASE_EVENTGROUP_PROJECTION).to.exist.and.be.an('object');
  });

  it('should have base type projection', () => {
    expect(DISPATCH_BASE_EVENTTYPE_PROJECTION).to.exist.and.be.an('object');
  });

  it('should have overview facet', () => {
    expect(DISPATCH_FACET_OVERVIEW).to.exist.and.be.an('object');
  });

  it('should have overall group facet', () => {
    expect(DISPATCH_FACET_OVERALL_EVENTGROUP).to.exist.and.be.an('object');
  });

  it('should have overall type facet', () => {
    expect(DISPATCH_FACET_OVERALL_EVENTTYPE).to.exist.and.be.an('object');
  });

  it('should expose base factory', () => {
    expect(getDispatchBaseAggregation).to.exist.and.be.a('function');
  });
});

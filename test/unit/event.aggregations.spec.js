import { expect } from '@lykmapipo/test-helpers';

import {
  EVENT_BASE_METRIC_FIELDS,
  EVENT_BASE_GROUP_PROJECTION,
  EVENT_BASE_TYPE_PROJECTION,
  EVENT_BASE_LEVEL_PROJECTION,
  EVENT_BASE_SEVERITY_PROJECTION,
  EVENT_BASE_CERTAINTY_PROJECTION,
  EVENT_BASE_STATUS_PROJECTION,
  EVENT_BASE_URGENCY_PROJECTION,
  EVENT_BASE_RESPONSE_PROJECTION,
  EVENT_BASE_AREA_PROJECTION,
  EVENT_FACET_OVERVIEW,
  EVENT_FACET_OVERALL_GROUP,
  getEventBaseAggregation,
} from '../../src';

describe('Event Aggregations', () => {
  it('should have flag metric fields', () => {
    expect(EVENT_BASE_METRIC_FIELDS).to.exist.and.be.an('object');
    expect(EVENT_BASE_METRIC_FIELDS.metrics.active).to.exist.and.be.an(
      'object'
    );
    expect(EVENT_BASE_METRIC_FIELDS.metrics.ended).to.exist.and.be.an('object');
    expect(EVENT_BASE_METRIC_FIELDS.metrics.durationTime).to.exist.and.be.an(
      'object'
    );
  });

  it('should have base group projection', () => {
    expect(EVENT_BASE_GROUP_PROJECTION).to.exist.and.be.an('object');
  });

  it('should have base type projection', () => {
    expect(EVENT_BASE_TYPE_PROJECTION).to.exist.and.be.an('object');
  });

  it('should have base level projection', () => {
    expect(EVENT_BASE_LEVEL_PROJECTION).to.exist.and.be.an('object');
  });

  it('should have base severity projection', () => {
    expect(EVENT_BASE_SEVERITY_PROJECTION).to.exist.and.be.an('object');
  });

  it('should have base certainty projection', () => {
    expect(EVENT_BASE_CERTAINTY_PROJECTION).to.exist.and.be.an('object');
  });

  it('should have base status projection', () => {
    expect(EVENT_BASE_STATUS_PROJECTION).to.exist.and.be.an('object');
  });

  it('should have base urgency projection', () => {
    expect(EVENT_BASE_URGENCY_PROJECTION).to.exist.and.be.an('object');
  });

  it('should have base response projection', () => {
    expect(EVENT_BASE_RESPONSE_PROJECTION).to.exist.and.be.an('object');
  });

  it('should have base area projection', () => {
    expect(EVENT_BASE_AREA_PROJECTION).to.exist.and.be.an('object');
  });

  it('should have overview facet', () => {
    expect(EVENT_FACET_OVERVIEW).to.exist.and.be.an('object');
  });

  it('should have overall group facet', () => {
    expect(EVENT_FACET_OVERALL_GROUP).to.exist.and.be.an('object');
  });

  it('should expose base factory', () => {
    expect(getEventBaseAggregation).to.exist.and.be.a('function');
  });
});

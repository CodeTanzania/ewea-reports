import { expect } from '@lykmapipo/test-helpers';

import {
  EVENT_FLAG_METRIC_FIELDS,
  EVENT_TIME_METRIC_FIELDS,
  getEventBaseAggregation,
} from '../../src';

describe('Event Aggregations', () => {
  it('should have flag metric fields', () => {
    expect(EVENT_FLAG_METRIC_FIELDS).to.exist.and.be.an('object');
    expect(EVENT_FLAG_METRIC_FIELDS.active).to.exist.and.be.an('object');
    expect(EVENT_FLAG_METRIC_FIELDS.ended).to.exist.and.be.an('object');
  });

  it('should have time metric fields', () => {
    expect(EVENT_TIME_METRIC_FIELDS).to.exist.and.be.an('object');
    expect(EVENT_TIME_METRIC_FIELDS.durationTime).to.exist.and.be.an('object');
  });

  it('should expose base factory', () => {
    expect(getEventBaseAggregation).to.exist.and.be.a('function');
  });
});

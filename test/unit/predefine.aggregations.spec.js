import { expect } from '@lykmapipo/test-helpers';

import {
  PREDEFINE_FLAG_METRIC_FIELDS,
  PREDEFINE_TIME_METRIC_FIELDS,
  getPredefineBaseAggregation,
} from '../../src';

describe('Event Aggregations', () => {
  it('should have flag metric fields', () => {
    expect(PREDEFINE_FLAG_METRIC_FIELDS).to.exist.and.be.an('object');
  });

  it('should have time metric fields', () => {
    expect(PREDEFINE_TIME_METRIC_FIELDS).to.exist.and.be.an('object');
  });

  it('should expose base factory', () => {
    expect(getPredefineBaseAggregation).to.exist.and.be.a('function');
  });
});

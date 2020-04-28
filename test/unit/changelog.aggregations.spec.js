import { expect } from '@lykmapipo/test-helpers';

import {
  CHANGELOG_FLAG_METRIC_FIELDS,
  CHANGELOG_TIME_METRIC_FIELDS,
  getChangeLogBaseAggregation,
} from '../../src';

describe('ChangeLog Aggregations', () => {
  it('should have flag metric fields', () => {
    expect(CHANGELOG_FLAG_METRIC_FIELDS).to.exist.and.be.an('object');
  });

  it('should have time metric fields', () => {
    expect(CHANGELOG_TIME_METRIC_FIELDS).to.exist.and.be.an('object');
  });

  it('should expose base factory', () => {
    expect(getChangeLogBaseAggregation).to.exist.and.be.a('function');
  });
});

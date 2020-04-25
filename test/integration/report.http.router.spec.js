import { mount } from '@lykmapipo/express-common';
import { clear as clearHttp, testGet } from '@lykmapipo/express-test-helpers';
import { expect } from '@lykmapipo/mongoose-test-helpers';
import { reportRouter } from '../../src';

describe('Reports Rest API', () => {
  before(() => clearHttp());

  before(() => {
    mount(reportRouter);
  });

  it('should handle HTTP GET on /v1/reports/overviews', (done) => {
    testGet('/v1/reports/overviews')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error, { body }) => {
        expect(error).to.not.exist;
        expect(body).to.exist;
        done(error, body);
      });
  });

  it('should handle HTTP GET on /v1//reports/indicators', (done) => {
    testGet('/v1//reports/indicators')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error, { body }) => {
        expect(error).to.not.exist;
        expect(body).to.exist;
        done(error, body);
      });
  });

  it('should handle HTTP GET on /v1/reports/risks', (done) => {
    testGet('/v1/reports/risks')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error, { body }) => {
        expect(error).to.not.exist;
        expect(body).to.exist;
        done(error, body);
      });
  });

  it('should handle HTTP GET on /v1/reports/actions', (done) => {
    testGet('/v1/reports/actions')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error, { body }) => {
        expect(error).to.not.exist;
        expect(body).to.exist;
        done(error, body);
      });
  });

  it('should handle HTTP GET on /v1/reports/needs', (done) => {
    testGet('/v1/reports/needs')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error, { body }) => {
        expect(error).to.not.exist;
        expect(body).to.exist;
        done(error, body);
      });
  });

  it('should handle HTTP GET on /v1/reports/effects', (done) => {
    testGet('/v1/reports/effects')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error, { body }) => {
        expect(error).to.not.exist;
        expect(body).to.exist;
        done(error, body);
      });
  });

  after(() => clearHttp());
});

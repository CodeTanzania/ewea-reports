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

  it('should handle HTTP GET on /v1/reports/indicators', (done) => {
    testGet('/v1/reports/indicators')
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

  it('should handle HTTP GET on /v1/reports/resources', (done) => {
    testGet('/v1/reports/resources')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error, { body }) => {
        expect(error).to.not.exist;
        expect(body).to.exist;
        done(error, body);
      });
  });

  it('should handle HTTP GET on /v1/reports/parties', (done) => {
    testGet('/v1/reports/parties')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error, { body }) => {
        expect(error).to.not.exist;
        expect(body).to.exist.and.be.an('object');
        expect(body.data).to.exist.and.be.an('object');
        expect(body.data.overview).to.be.eql({
          total: 4,
          agency: 2,
          focal: 2,
          level: 4, // FIX
          area: 4, // FIX
          group: 4, // FIX
          role: 4, // FIX
          active: 4,
          inactive: 0,
        });
        expect(body.data.overall.levels).to.exist.and.be.an('array');
        expect(body.data.overall.areas).to.exist.and.be.an('array');
        expect(body.data.overall.groups).to.exist.and.be.an('array');
        expect(body.data.overall.roles).to.exist.and.be.an('array');
        done(error, body);
      });
  });

  it('should handle HTTP GET on /v1/reports/resources', (done) => {
    testGet('/v1/reports/resources')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error, { body }) => {
        expect(error).to.not.exist;
        expect(body).to.exist;
        done(error, body);
      });
  });

  it('should handle HTTP GET on /v1/reports/alerts', (done) => {
    testGet('/v1/reports/alerts')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error, { body }) => {
        expect(error).to.not.exist;
        expect(body).to.exist;
        done(error, body);
      });
  });

  it('should handle HTTP GET on /v1/reports/events', (done) => {
    testGet('/v1/reports/events')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error, { body }) => {
        expect(error).to.not.exist;
        expect(body).to.exist;
        done(error, body);
      });
  });

  it('should handle HTTP GET on /v1/reports/dispatches', (done) => {
    testGet('/v1/reports/dispatches')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error, { body }) => {
        expect(error).to.not.exist;
        expect(body).to.exist;
        done(error, body);
      });
  });

  it('should handle HTTP GET on /v1/reports/cases', (done) => {
    testGet('/v1/reports/cases')
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

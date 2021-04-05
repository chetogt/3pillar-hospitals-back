import { close } from 'inspector';
import request from 'supertest';
import app from '../../src/app';
import { connect, closeDatabase } from '../../src/repositories/__mocks__/db_handler';

jest.setTimeout(30000);

let server: any = null;
let agent: any = null;

describe('User services', () => {
  beforeAll(async (done) => {
    await connect();
    server = app
      .listen(3002, () => {
        agent = request.agent(server);
        done();
      }).on('error', (err) => {
        done(err);
      });
  });

  it('should create user', async () => {
    const res = await request(app).post('/v1/users').send({
      "name": "Test User",
      "email": "test@email.com",
      "password": "p123"
    });
    expect(res.status).toEqual(200);
    expect(typeof res.body.data).toEqual('object');
    expect(typeof res.body.data.token).toEqual('string');
    expect(res.body.msj.length).toBeGreaterThanOrEqual(1);
    expect(res.body.msj).toEqual('User created');
  });

  it('should throw user already exists', async () => {
    const res = await request(app).post('/v1/users').send({
      "name": "Test User 2",
      "email": "test@email.com",
      "password": "p123"
    });
    expect(res.status).toEqual(400);
    expect(res.body.status).toEqual('Error');
    expect(res.body.message).toEqual('User already exists');
    expect(res.body.errors).toBeNull();
  });

  afterAll(async () => {
    await closeDatabase();
  });
});

describe('User services with error on json body', () => {
  beforeAll(async (done) => {
    await connect();
    server = app
      .listen(3003, () => {
        agent = request.agent(server);
        done();
      }).on('error', (err) => {
        done(err);
      });
  });

  it('should throw error on missing property', async () => {
    const res = await request(app).post('/v1/users').send({
      "name": "Test User",
      "email": "test@email.com"
    });
    expect(res.status).toEqual(400);
    expect(res.body.status).toEqual('Error');
    expect(res.body.message).toEqual('Invalid field');
    expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
    expect(res.body.errors[0].msg).toEqual('Password is required.');
    expect(res.body.errors[0].param).toEqual('password');
    expect(res.body.errors[0].location).toEqual('body');
  });

  afterAll(async () => {
    await closeDatabase();
  });
});
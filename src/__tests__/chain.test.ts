import FutureEither, { FutureEitherInstance } from '../index';
import Future from 'fluture';

describe('Chain()', () => {
  test('should chain to another FutureEither instance', async () => {
    const p = FutureEither.resolve(20)
      .chain(future => FutureEither.fromFuture(future.map(n => n * n)))
      .toPromiseValue();
    await expect(p).resolves.toEqual(400);
  });

  test('should not interferce from chainRej()', async () => {
    const p = FutureEither.resolve(30)
      .chainRej(err => FutureEither.fromFuture(Future.reject(err)))
      .chain(future => FutureEither.fromFuture(future.map(n => n * n)))
      .toPromiseValue();

    await expect(p).resolves.toEqual(900);
  });

  test('should chain a lot of times', async () => {
    const p = FutureEither.resolve(20)
      .chain(future => FutureEither.fromFuture(future.map(n => n * n)))
      .chain(future => FutureEither.fromFuture(future.map(n => n / 2)))
      .toPromiseValue();
    await expect(p).resolves.toEqual(200);
  });

  test('should reject error in promise value', async () => {
    const p = FutureEither.resolve(20)
      .chain(future => FutureEither.reject(new Error('some error')))
      .toPromiseValue();
    await expect(p).rejects.toThrow('some error');
  });
});

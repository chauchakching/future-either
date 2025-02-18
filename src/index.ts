import { FutureInstance } from 'fluture';
import * as Future from 'fluture';

export type FutureEitherType<L, R> = FutureInstance<any, FutureInstance<L, R>>;

export class FutureEitherInstance<L, R> {
  public futureEither: FutureEitherType<L, R>;

  constructor(futureEither: FutureEitherType<L, R>) {
    this.futureEither = futureEither;
  }

  public chainLeft<V>(f: (a: L) => FutureInstance<any, V>): FutureEitherInstance<V, R> {
    // @ts-ignore
    return new FutureEitherInstance(
      this.futureEither.chain(
        eitherValue =>
          eitherValue.map(rv => Future.of(rv)).chainRej(lv => f(lv).chain((v: V) => Future.of(Future.reject(v)))),
      ),
    );
  }

  public chainRight<R>(f: (a: R) => FutureInstance<L, R>): FutureEitherInstance<L, R> {
    // @ts-ignore
    return this.chain(eitherValue => fromFuture(eitherValue.chain<R>(f)));
  }

  public chain(mapper: (a: FutureInstance<L, R>) => FutureEitherInstance<L, R>): FutureEitherInstance<L, R> {
    return new FutureEitherInstance(this.futureEither.chain(future => mapper(future).futureEither));
  }

  public chainRej(mapper: (a: any) => FutureEitherInstance<L, R>): FutureEitherInstance<L, R> {
    return new FutureEitherInstance(this.futureEither.chainRej(future => mapper(future).futureEither));
  }

  public mapLeft<V>(mapper: (a: L) => V): FutureEitherInstance<V, R> {
    return new FutureEitherInstance(this.futureEither.chain(fe => Future.of(fe.mapRej(mapper))));
  }

  public mapRight<V>(mapper: (a: R) => V): FutureEitherInstance<L, V> {
    return new FutureEitherInstance(this.futureEither.chain(fe => Future.of(fe.map(mapper))));
  }

  public toValue(): FutureInstance<L, R> {
    // @ts-ignore
    return this.futureEither.chain(fe => fe);
  }

  public async toPromiseValue(): Promise<R> {
    const eitherValue = await this.futureEither.promise();
    return eitherValue.promise();
  }
}

function fromFuture<L, R>(future: FutureInstance<L, R>): FutureEitherInstance<L, R> {
  return new FutureEitherInstance(Future.of(future));
}

export default {
  resolve<L, R>(v: R): FutureEitherInstance<L, R> {
    return new FutureEitherInstance(Future.of(Future.of(v)));
  },
  reject<L, R>(reason: any): FutureEitherInstance<L, R> {
    return new FutureEitherInstance(Future.reject(reason));
  },
  fromFuture,
  fromPromise<L, R, A>(fn: (a: A) => Promise<R>): (a: A) => FutureEitherInstance<L, R> {
    const futureP = Future.encaseP<L, R, A>(fn);

    return (a: A) => new FutureEitherInstance(Future.of(futureP(a)));
  },

  fromP2<L, R, A, B>(fn: (a: A, b: B) => Promise<R>): (a: A, b: B) => FutureEitherInstance<L, R> {
    const futureP = Future.encaseP2<L, R, A, B>(fn);

    return (a: A, b: B) => new FutureEitherInstance(Future.of(futureP(a, b)));
  },

  fromP3<L, R, A, B, C>(fn: (a: A, b: B, c: C) => Promise<R>): (a: A, b: B, c: C) => FutureEitherInstance<L, R> {
    const futureP = Future.encaseP3<L, R, A, B, C>(fn);

    return (a: A, b: B, c: C) => new FutureEitherInstance(Future.of(futureP(a, b, c)));
  },
};

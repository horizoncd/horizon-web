import store from 'store2';
import Expression from '@/components/FilterBox/Expression';

const reviewKey = 'lastReview';

export function getLastReview() {
  let result = store.get(reviewKey) as Expression[];
  if (result === null) {
    result = [{}];
  }
  return result;
}

export function setLastReview(v: Expression[]) {
  return store.set(reviewKey, v);
}

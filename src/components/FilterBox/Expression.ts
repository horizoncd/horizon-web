/* eslint-disable import/prefer-default-export */
interface Expression {
  search?: string;
  conditionType?: 'OR' | 'AND';
  category?: string;
  operator?: string;
  value?: string;
  expressions?:Expression[];
}

export default Expression;

import { useIntl } from 'umi';
import Expression from '../FilterBox/Expression';
import HorizonAutoCompleteHandler, { AutoCompleteOption } from '../FilterBox/HorizonAutoCompleteHandler';
import { TagsFilter } from '../FilterBox/TagFilter';

interface Props {
  defaultValues?: SearchInput[] | undefined
  // selector array, selector example: a=b,c,d
  tagSelectors: MultiValueTag[];
  onSearch: (inputs: SearchInput[]) => void;
  onClear: () => void;
}

export type SearchInput = {
  type?: SearchInputType,
  key?: string,
  operator?: string,
  value: string,
};

export type MultiValueTag = {
  key: string,
  values: string[],
};

export enum SearchInputType {
  Tag = 'tag',
  Value = 'value',
}

const TagSearch = (props: Props) => {
  const {
    defaultValues, tagSelectors, onSearch, onClear,
  } = props;
  const intl = useIntl();
  const tokens: AutoCompleteOption[] = tagSelectors.map((tag) => ({
    key: tag.key,
    type: 'selection',
    values: [
      {
        operator: '=',
        possibleValues: tag.values,
      },
    ],
  }));

  let values: Expression[] = [];
  if (defaultValues) {
    values = defaultValues.filter(
      (defaultValue) => defaultValue && defaultValue.value !== '',
    ).map((defaultValue) => {
      if (defaultValue.key) {
        return {
          category: defaultValue.key,
          operator: defaultValue.operator,
          value: defaultValue.value,
        };
      }
      return { search: defaultValue.value };
    });
  }

  return (
    <div style={{ flex: 1, marginBottom: '20px' }}>
      <TagsFilter
        autoCompleteHandler={new HorizonAutoCompleteHandler(tokens)}
        placeHolder={intl.formatMessage({ id: 'pages.message.searchByTag.hint' })}
        defaultExprs={values}
        onSubmit={(inputs: any[]) => {
          const results = inputs.map((input) => {
            if (typeof (input) === 'string') {
              return {
                type: SearchInputType.Value,
                value: input,
              };
            }
            return {
              type: SearchInputType.Tag,
              key: input.type,
              operator: input.value.operator,
              value: input.value.data,
            };
          });
          onSearch(results);
        }}
        onClear={onClear}
      />
    </div>
  );
};

TagSearch.defaultProps = {
  defaultValues: [],
};

export default TagSearch;

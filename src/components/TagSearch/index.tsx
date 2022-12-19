import { useIntl } from 'umi';
import { TagsInput } from '../TagSelector';

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
  const tokens = tagSelectors.map((tag) => {
    const options = tag.values.map((v) => ({
      value: v,
      title: v,
    }));
    return {
      type: tag.key,
      title: tag.key,
      unique: true,
      operators: [
        {
          value: '=',
          description: '=',
        },
      ],
      options,
    };
  });

  let values: any[] = [];
  if (defaultValues) {
    values = defaultValues.filter(
      (defaultValue) => defaultValue && defaultValue.value !== '',
    ).map((defaultValue) => {
      if (defaultValue.key) {
        return {
          type: defaultValue.key,
          value: {
            data: defaultValue.value,
            operator: defaultValue.operator,
          },
        };
      }
      return defaultValue.value;
    });
  }

  return (
    <div style={{ flex: 1, marginBottom: '20px' }}>
      <TagsInput
        placeHolder={intl.formatMessage({ id: 'pages.message.searchByTag.hint' })}
        avaliableTokens={tokens}
        values={values}
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

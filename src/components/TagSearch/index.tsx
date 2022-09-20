// @ts-ignore
import { GlFilteredSearch, GlFilteredSearchToken } from '@gitlab/ui';
import { applyVueInReact } from 'vuereact-combined';
import '@gitlab/ui/dist/index.css';
import '@gitlab/ui/dist/utility_classes.css';

const ReactFilteredSearch = applyVueInReact(GlFilteredSearch);

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

export default (props: Props) => {
  const {
    defaultValues, tagSelectors, onSearch, onClear,
  } = props;
  const tokens = tagSelectors.map((tag) => {
    const options = tag.values.map((v) => ({
      value: v,
      title: v,
    }));
    return {
      type: tag.key,
      title: tag.key,
      token: GlFilteredSearchToken,
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
      (defaultValue) => defaultValue && defaultValue.value != '',
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
      <ReactFilteredSearch
        placeholder="Search by tags or name"
        availableTokens={tokens}
        value={values}
        on={{
          clear: onClear,
          submit: (inputs: any[]) => {
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
          },
        }}
      />
    </div>
  );
};

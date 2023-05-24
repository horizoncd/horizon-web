declare namespace TAG {
  type Tag = {
    key: string
    value: string
  };

  type TagSelector = {
    key: string
    operator: string
    values: string[]
  };

  type MetaTag = {
    tagKey: string
    tagValue: string
    description: string
    createdAt: string
    updatedAt: string
  };
}

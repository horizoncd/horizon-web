function escapeForRegExp(s: string) {
  return s.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
}

function matchAny(s: string) {
  return new RegExp(escapeForRegExp(s), 'gi');
}

function QueryBoldSpan(props: { query: string, children: string }) {
  const { query, children } = props;
  const regexp = matchAny(query);
  const htmls = children.replace(regexp, '<b>$&</b>');
  // eslint-disable-next-line react/no-danger
  return <span dangerouslySetInnerHTML={{ __html: htmls }} />;
}

export default QueryBoldSpan;

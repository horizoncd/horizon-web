export function setQuery(obj: Record<string, string>) {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  const setOrRemove = (key: string, value: string) => {
    if (value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  };
  Object.keys(obj).forEach((k) => {
    setOrRemove(k, obj[k]);
  });
  url.search = params.toString();
  window.history.pushState(null, '', url.toString());
}

export default { setQuery };

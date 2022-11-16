export default function ExactTime(props: { time: string | Date }) {
  const { time } = props;
  if (time === undefined) {
    return <span />;
  }
  const exactTime = typeof time === 'string'
    ? new Date(time)
    : time;
  return (
    <span>
      {exactTime.toLocaleString()}
    </span>
  );
}

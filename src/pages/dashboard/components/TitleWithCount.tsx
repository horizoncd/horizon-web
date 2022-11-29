interface TitleWithCountProps {
  name: string
  count: number
}

function TitleWithCount(props: TitleWithCountProps) {
  const { name, count } = props;
  return (
    <div>
      {name}
      <span style={{
        borderRadius: '50%',
        backgroundColor: '#f0f0f0',
        marginLeft: '2px',
        padding: '0 5px',
        borderWidth: '1px',
      }}
      >
        {count}

      </span>
    </div>
  );
}

export default TitleWithCount;

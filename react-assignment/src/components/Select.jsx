export default function SelectField(props) {
  const { placeholder, id, options, value, onSelect } = props;

  return (
    <section role="dropdown">
      <select
        value={value}
        onChange={(e) => onSelect(e.target.value)}
        id={id}
      >
        <option value="">{placeholder}</option>
        {options.map((val) => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </select>
    </section>
  );
}


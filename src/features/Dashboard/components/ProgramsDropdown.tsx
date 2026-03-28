import Select from "react-select";

const ProgramsDropdown = ({ data, value, onChange }) => {
  return (
    <Select
      options={data ?? []}
      value={value}
      onChange={onChange}
      className="react-select-container"
      classNamePrefix="react-select"
    />
  );
};

export default ProgramsDropdown;

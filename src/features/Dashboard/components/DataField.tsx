interface DataFieldProps {
  label: string;
  value?: string;
}

const DataField = ({ label, value }: DataFieldProps) => {
  return (
    <div>
      <h6 className="text-sm font-bold text-gray-700 mb-1">{label}</h6>
      <p className="text-gray-600">{value || "-"}</p>
    </div>
  );
};

export default DataField;

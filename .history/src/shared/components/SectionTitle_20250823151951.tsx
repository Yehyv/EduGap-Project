import TitleLine from "@/assets/svgs/TitileLine.svg?react";
const SectionTitle = ({
  textTitle,
  lineWidth = "w-32",
}: {
  textTitle: string;
  lineWidth?: string;
}) => {
  return (
    <div className="mb-5">
      <h2 className="mb-0"> {textTitle}</h2>
      <TitleLine className={lineWidth} />
    </div>
  );
};

export default SectionTitle;

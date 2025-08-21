import TitleLine from "@/assets/svgs/TitileLine.svg?react";
const SectionTitle = ({ textTitle }: { textTitle: string }) => {
  return (
    <div>
      <h3 className="mb-0"> {textTitle}</h3>
      <TitleLine className="w-32" />
    </div>
  );
};

export default SectionTitle;

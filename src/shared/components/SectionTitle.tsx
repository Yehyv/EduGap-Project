import TitleLine from "@/assets/svgs/TitileLine.svg?react";
const SectionTitle = ({ textTitle }: { textTitle: string }) => {
  return (
    <div className="mb-5">
      <h2 className="mb-0"> {textTitle}</h2>
      <TitleLine className="w-32" />
    </div>
  );
};

export default SectionTitle;

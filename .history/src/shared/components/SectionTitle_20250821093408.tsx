import TitleLine from "@/assets/svgs/TitileLine.svg?react";
const SectionTitle = ({ textTitle }: { textTitle: string }) => {
  return (
    <div>
      <h2>{textTitle}</h2>
      <TitleLine className="w-32" />
    </div>
  );
};

export default SectionTitle;

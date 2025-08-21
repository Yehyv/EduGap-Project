import TitleLine from "@/assets/svgs/TitileLine.svg?react";
const SectionTitle = ({ textTitle }: { textTitle: string }) => {
  return (
    <>
      <h3>{textTitle}</h3>
      <TitleLine />
    </>
  );
};

export default SectionTitle;

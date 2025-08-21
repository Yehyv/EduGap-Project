import TitleLine from "@/assets/svgs/TitileLine.svg?react";
const SectionTitle = ({ textTitle }: { textTitle: string }) => {
  return (
    <>
      <div>{textTitle}</div>
      <TitleLine />
    </>
  );
};

export default SectionTitle;

const SectionTitle = ({ textTitle }: { textTitle: string }) => {
  return (
    <>
      <div>{textTitle}</div>
      <div class="relative w-32 h-2 overflow-hidden zigzag-line"></div>
    </>
  );
};

export default SectionTitle;

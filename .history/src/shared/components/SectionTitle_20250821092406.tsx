const SectionTitle = ({ textTitle }: { textTitle: string }) => {
  return (
    <>
      <div>{textTitle}</div>
      <div className="relative w-32 h-4 overflow-hidden">
        <div className="absolute w-full h-0.5 bg-[] transform origin-left animate-zigzag"></div>
      </div>
      <div className="zigzag-line"></div>
    </>
  );
};

export default SectionTitle;

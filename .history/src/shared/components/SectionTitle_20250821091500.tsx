const SectionTitle = ({ textTitle }: { textTitle: string }) => {
  return (
    <>
      <div>{textTitle}</div>
      <div className="flex gap-0.5">
        <div className="w-2 h-2 border-b-2 border-black transform rotate-45"></div>
        <div className="w-2 h-2 border-b-2 border-black transform -rotate-45"></div>
        <div className="w-2 h-2 border-b-2 border-black transform rotate-45"></div>
        <div className="w-2 h-2 border-b-2 border-black transform -rotate-45"></div>
        <div className="w-2 h-2 border-b-2 border-black transform rotate-45"></div>
      </div>
    </>
  );
};

export default SectionTitle;

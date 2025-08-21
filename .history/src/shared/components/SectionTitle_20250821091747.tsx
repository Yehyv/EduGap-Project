const SectionTitle = ({ textTitle }: { textTitle: string }) => {
  return (
    <>
      <div>{textTitle}</div>
      <div className="vorder bg-tertiary"></div>
    </>
  );
};

export default SectionTitle;

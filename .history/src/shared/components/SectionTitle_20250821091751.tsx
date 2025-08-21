const SectionTitle = ({ textTitle }: { textTitle: string }) => {
  return (
    <>
      <div>{textTitle}</div>
      <div className="border bg-tertiary"></div>
    </>
  );
};

export default SectionTitle;

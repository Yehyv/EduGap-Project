const SectionTitle = ({ textTitle }: { textTitle: string }) => {
  return (
    <>
      <div>{textTitle}</div>

      <div className="zigzag-line"></div>
    </>
  );
};

export default SectionTitle;

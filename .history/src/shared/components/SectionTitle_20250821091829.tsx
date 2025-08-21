const SectionTitle = ({ textTitle }: { textTitle: string }) => {
  return (
    <>
      <div>{textTitle}</div>
      <div className="border bg-tertiary max-w-32"></div>
    </>
  );
};

export default SectionTitle;

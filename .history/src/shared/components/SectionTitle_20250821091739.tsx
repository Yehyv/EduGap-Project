const SectionTitle = ({ textTitle }: { textTitle: string }) => {
  return (
    <>
      <div>{textTitle}</div>
      <div className="flex gap-0.5"></div>
    </>
  );
};

export default SectionTitle;

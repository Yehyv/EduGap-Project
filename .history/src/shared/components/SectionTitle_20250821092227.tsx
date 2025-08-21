const SectionTitle = ({ textTitle }: { textTitle: string }) => {
  return (
    <>
      <div>{textTitle}</div>
      <div class="tw-relative tw-w-32 tw-h-2 tw-overflow-hidden tw-zigzag-line"></div>
    </>
  );
};

export default SectionTitle;

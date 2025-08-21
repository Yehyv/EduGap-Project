const SectionTitle = ({ textTitle }: { textTitle: string }) => {
  return (
    <>
      <div>{textTitle}</div>
      <div class="tw-flex tw-gap-0.5">
        <div class="tw-w-2 tw-h-2 tw-border-b-2 tw-border-black tw-transform tw-rotate-45"></div>
        <div class="tw-w-2 tw-h-2 tw-border-b-2 tw-border-black tw-transform tw--rotate-45"></div>
        <div class="tw-w-2 tw-h-2 tw-border-b-2 tw-border-black tw-transform tw-rotate-45"></div>
        <div class="tw-w-2 tw-h-2 tw-border-b-2 tw-border-black tw-transform tw--rotate-45"></div>
        <div class="tw-w-2 tw-h-2 tw-border-b-2 tw-border-black tw-transform tw-rotate-45"></div>
      </div>
    </>
  );
};

export default SectionTitle;

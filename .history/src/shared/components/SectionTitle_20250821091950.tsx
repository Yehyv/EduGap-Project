const SectionTitle = ({ textTitle }: { textTitle: string }) => {
  return (
    <>
      <div>{textTitle}</div>
      <div class="w-32 h-8">
        <svg
          class="w-full h-full"
          viewBox="0 0 100 20"
          preserveAspectRatio="none"
        >
          <path
            d="M0 20 Q25 0 50 20 T100 20"
            stroke="#F97316"
            stroke-width="2"
            fill="transparent"
          />
        </svg>
      </div>{" "}
    </>
  );
};

export default SectionTitle;

const SectionTitleWithContent = ({
  paragraphText,
  title,
  children,
}: {
  paragraphText?: string;
  title: string;
  children?: React.ReactElement;
}) => {
  return (
    <div>
      <h3 className="border-s-3 border-secondary ps-2 mb-4">{title}</h3>
      {paragraphText ? (
        <p className="text-[#575757]">{paragraphText}</p>
      ) : (
        children
      )}
    </div>
  );
};

export default SectionTitleWithContent;

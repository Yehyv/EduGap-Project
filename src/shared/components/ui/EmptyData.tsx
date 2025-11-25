import EmptyBoxAnimation from "../EmptyBoxAnimation";

const EmptyData = ({ messageToShow }: { messageToShow: string }) => {
  return (
    <div className="flex flex-col justify-center items-center mb-20">
      <EmptyBoxAnimation />
      <h3>{messageToShow}</h3>
    </div>
  );
};

export default EmptyData;

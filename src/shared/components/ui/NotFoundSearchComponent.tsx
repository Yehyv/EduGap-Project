import Lottie from "lottie-react";
import LottieIcon from "../../../assets/lottie/NoResultsFoundLottie.json";

const NotFoundSearchComponent = ({ className }: { className?: string }) => {
  return (
    <Lottie
      animationData={LottieIcon}
      loop={true}
      autoplay={true}
      className={`w-80 -mt-52 ${className ?? ""} `}
    />
  );
};

export default NotFoundSearchComponent;

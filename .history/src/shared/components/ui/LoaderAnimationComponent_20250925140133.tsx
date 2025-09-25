import Lottie from "lottie-react";
import LottieIcon from "../../../assets/lottie/LoaderAnimation.json";

const LoaderAnimationComponent = ({ className }) => {
  return (
    <Lottie
      animationData={LottieIcon}
      loop={true}
      autoplay={true}
      className={`tw-w-56 -tw-mt-20 ${className ?? ""} `}
    />
  );
};

export default LoaderAnimationComponent;

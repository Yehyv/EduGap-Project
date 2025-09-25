import Lottie from "lottie-react";
import LottieIcon from "../../../assets/lottie/LoaderAnimation.json";

const LoaderAnimationComponent = ({ className }: { className?: string }) => {
  return (
    <Lottie
      animationData={LottieIcon}
      loop={true}
      autoplay={true}
      className={`w-62 -mt-40 ${className ?? ""} `}
    />
  );
};

export default LoaderAnimationComponent;

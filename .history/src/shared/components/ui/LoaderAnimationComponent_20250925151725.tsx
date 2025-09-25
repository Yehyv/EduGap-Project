import Lottie from "lottie-react";
import LottieIcon from "../../../assets/lottie/LoaderAnimation.json";

const LoaderAnimationComponent = ({ className }: { className?: string }) => {
  return (
    <Lottie
      animationData={LottieIcon}
      loop={true}
      autoplay={true}
      className={`h-62 -mt-60 ${className ?? ""} `}
    />
  );
};

export default LoaderAnimationComponent;

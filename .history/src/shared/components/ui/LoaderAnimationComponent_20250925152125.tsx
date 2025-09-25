import Lottie from "lottie-react";
import LottieIcon from "../../../assets/lottie/LoaderAnimation.json";

const LoaderAnimationComponent = ({ className }: { className?: string }) => {
  return (
    <Lottie
      animationData={LottieIcon}
      loop
      autoplay
      className={`w-40 ${className ?? ""}`}
    />
  );
};

export default LoaderAnimationComponent;

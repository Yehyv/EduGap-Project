import Lottie from "lottie-react";
import success from "@/assets/lottie/EmptyBox.json";

export default function EmptyBoxAnimation() {
  return <Lottie animationData={success} loop autoplay className="w-50" />;
}

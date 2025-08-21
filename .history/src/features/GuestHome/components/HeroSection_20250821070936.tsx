import DefaultButton from "@/shared/components/ui/DefaultButton";
import HeroImage from "../../../assets/imgs/HeroSectionImage.png";

const HeroSection = () => {
  return (
    <div className="bg-primary">
      <div className="container flex">
        <div className="w-2/3">
          <h3 className="text-text-first">
            منصتك الشاملة لتعلّم المهارات والتخصصات المختلفة أونلاين، في أي وقت
            ومن أي مكان، مع أفضل الكورسات المعتمدة والمدربين المتميزين.
          </h3>
          <p className="text-text-second font-semibold">
            طوّر نفسك من موبايلك! اشترك دلوقتي وابدأ تتعلم اللي بتحبه وقت ما
            تحب.
          </p>
          <DefaultButton
            onClick={() => {}}
            text="اشترك الأن"
            type="button"
            moreStyle="px-8 !py-1 text-xl shadow"
          />
        </div>
        <div className="relative w-full">
          <div className="absolute end-0 top-0 w-[300px] h-[300px] bg-[#E8ECFF] rounded-full">
            <div className="absolute start-3 bottom-5 w-[220px] h-[220px] bg-[#E0DEDE] rounded-full"></div>
            <img
              className="absolute start-0 bottom-5 w-[280px] h-[280px]"
              src={HeroImage}
              alt=""
            ></img>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

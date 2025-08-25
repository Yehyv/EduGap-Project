import DefaultButton from "@/shared/components/ui/DefaultButton";
import HeroSectionImage from "@/assets/imgs/HeroSectionImage.png";

const HeroSection = () => {
  return (
    <div className="bg-primary">
      <div className="container flex flex-col-reverse md:flex-row items-center pt-10 md:pt-16 justify-between gap-10">
        {/* Text Section */}
        <div className="w-full md:max-w-[680px] text-center md:text-right">
          <h1 className="text-text-first text-2xl md:text-3xl lg:text-4xl font-second font-medium leading-snug pt-6 pb-3">
            منصتك الشاملة لتعلّم المهارات والتخصصات المختلفة أونلاين، في أي وقت
            ومن أي مكان، مع أفضل الكورسات المعتمدة والمدربين المتميزين.
          </h1>
          <p className="text-text-second font-second font-semibold text-base md:text-lg">
            طوّر نفسك من موبايلك! اشترك دلوقتي وابدأ تتعلم اللي بتحبه وقت ما
            تحب.
          </p>
          <div className="text-center md:text-right">
            <DefaultButton
              onClick={() => {}}
              text="اشترك الأن"
              type="button"
              moreStyle="px-10 md:px-16 text-lg md:text-xl mt-8 md:mt-16 !shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]"
            />
          </div>
        </div>

        {/* Image Section */}
        <div className="w-full md:w-[40%] flex justify-center md:justify-end">
          <img
            className="w-[80%] md:w-full max-w-sm md:max-w-full"
            src={HeroSectionImage}
            alt="Hero Section"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

import DefaultButton from "@/shared/components/ui/DefaultButton";
import HeroSectionImage from "@/assets/imgs/HeroSectionImage.png";

const HeroSection = () => {
  return (
    <div className="bg-primary">
      <div className="container flex pt-10">
        <div className="w-full">
          <h1 className="text-text-first text-3xl font-second font-medium leading-snug pt-6 pb-3 max-w-[680px]">
            منصتك الشاملة لتعلّم المهارات والتخصصات المختلفة أونلاين، في أي وقت
            ومن أي مكان، مع أفضل الكورسات المعتمدة والمدربين المتميزين.
          </h1>
          <p className="text-text-second font-second text-sm font-semibold">
            طوّر نفسك من موبايلك! اشترك دلوقتي وابدأ تتعلم اللي بتحبه وقت ما
            تحب.
          </p>
          <div className="text-center">
            <DefaultButton
              onClick={() => {}}
              text="اشترك الأن"
              type="button"
              moreStyle="px-16 text-xl !shadow-2xl mt-16"
            />
          </div>
        </div>
        <div className="w-[40%]">
          <img className="ms-auto w-full" src={HeroSectionImage}></img>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

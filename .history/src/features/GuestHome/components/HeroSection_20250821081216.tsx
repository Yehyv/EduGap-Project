import DefaultButton from "@/shared/components/ui/DefaultButton";
import HeroSectionImage from "@/assets/imgs/HeroSectionImage.png";

const HeroSection = () => {
  return (
    <div className="bg-primary">
      <div className="container flex pt-10">
        <div className="w-[80%]">
          <h2 className="text-text-first font-second font-medium leading-snug">
            منصتك الشاملة لتعلّم المهارات والتخصصات المختلفة أونلاين، في أي وقت
            ومن أي مكان، مع أفضل الكورسات المعتمدة والمدربين المتميزين.
          </h2>
          <p className="text-text-second font-third font-bold">
            طوّر نفسك من موبايلك! اشترك دلوقتي وابدأ تتعلم اللي بتحبه وقت ما
            تحب.
          </p>
          <div className="text-center">
            <DefaultButton
              onClick={() => {}}
              text="اشترك الأن"
              type="button"
              moreStyle="px-8 !py-1 text-xl shadow mt-10"
            />
          </div>
        </div>
        <div className="relative w-full">
          <img width={350} className="ms-auto" src={HeroSectionImage}></img>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

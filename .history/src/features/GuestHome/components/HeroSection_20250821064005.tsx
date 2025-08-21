import DefaultButton from "@/shared/components/ui/DefaultButton";

const HeroSection = () => {
  return (
    <div className="bg-primary">
      <h3 className="text-text-first">
        منصتك الشاملة لتعلّم المهارات والتخصصات المختلفة أونلاين، في أي وقت ومن
        أي مكان، مع أفضل الكورسات المعتمدة والمدربين المتميزين.
      </h3>
      <p className="text-text-second">
        طوّر نفسك من موبايلك! اشترك دلوقتي وابدأ تتعلم اللي بتحبه وقت ما تحب.
      </p>
      <DefaultButton
        onClick={() => {}}
        text="اشترك الأن"
        type="button"
        moreStyle="px-8 py-1"
      />
    </div>
  );
};

export default HeroSection;

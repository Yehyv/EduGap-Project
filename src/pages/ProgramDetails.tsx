import IconsGroup from "@/assets/svgs/iconsGroup.svg?react";
import { useLanguage } from "@/shared/localization/useLanguage";
import TimeIcon from "@/assets/svgs/TimeIcon.svg?react";
import programImage from "@/assets/imgs/ForDev/programImage.jpg";
import SectionTitle from "@/shared/components/SectionTitle";
import ExpandableText from "@/shared/components/ui/ExpandableText";
import CheckIcon from "@/assets/svgs/CheckIcon.svg?react";
import VideoIcon from "@/assets/svgs/VideoIcon.svg?react";
import { Loader } from "@/shared/components";
import CoursesInProgram from "@/shared/components/EduGap/CoursesInProgram";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getPackageDetails } from "@/features/CourseDetails/services/contentDetails";
import ErrorMessage from "@/shared/components/ErrorMessage";
import { formatDuration } from "@/shared/utils/globals";
import SaveButton from "@/features/SavedIrems/components/SaveButton";
import { saveProgramLearningPath } from "@/features/SavedIrems/services/savedApis";

const ProgramDetails = () => {
  const { t, lang } = useLanguage();
  const { programId } = useParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getPackageDetails", programId],
    queryFn: () => getPackageDetails(programId ?? ""),
  });

  const whatToLearn = data?.learning_outcoms.split(",");

  if (isLoading) return <Loader />;

  if (isError)
    return (
      <ErrorMessage
        message={error.message ?? t("error_fetching_package_details")}
      />
    );

  return (
    <div>
      <div className="relative bg-gradient-to-b from-primary to-[white] py-14">
        <IconsGroup className="absolute start-0 end-0 top-0 bottom-0 w-full h-full" />
        <div className="container flex justify-between max-md:flex-col-reverse max-md:gap-10 max-md:items-center">
          <div className="w-1/3 max-md:w-full">
            <h5 className="font-bold mt-2">{t("program_title")}</h5>
            <h4 className="text-2xl mt-2"> {data?.title} </h4>

            <div className="flex justify-between mt-4">
              <div className="flex gap-2">
                <VideoIcon />
                <div>
                  {data?.contentsCount} {t("courses")}
                </div>
              </div>

              <div className="flex gap-2">
                <TimeIcon />
                <div>{formatDuration(data?.totalDuration ?? 0, lang)}</div>
              </div>
            </div>
            <div className="relative mt-10 -ms-2">
              <SaveButton
                id={+data!.id}
                isSaved={data?.isSaved ?? false}
                messageForUnSaved={t("Save_Learning_unsaved")}
                messageForSaved={t("Save_Learning_saved")}
                saveFunction={saveProgramLearningPath}
                invalidateQueriesKeys={[
                  {
                    queryKey: ["getPackageDetails", programId],
                  },
                ]}
              />
              <span className="inline-block ms-12">Save Learning Path</span>
            </div>
          </div>

          <div className="relative w-[200px] h-[200px] max-md:w-[150px] max-md:h-[150px] me-[50px]">
            <div className="absolute w-[200px] h-[200px] max-md:w-[150px] max-md:h-[150px] start-6 bg-[#FCB737] rounded-2xl -rotate-[30deg]" />
            <div className="absolute rounded-2xl overflow-hidden -rotate-[30deg]">
              <img
                src={data?.image ?? programImage}
                alt={t("program_image_alt")}
                className="w-full h-full object-cover rotate-[30deg] scale-150"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div>
          <SectionTitle textTitle={t("about_learning_program")} />
          <ExpandableText limit={2} text={data?.description ?? ""} />
        </div>

        <section className="py-10">
          <SectionTitle textTitle={t("what_to_learn")} />
          <ul className="space-y-4 mt-4">
            {whatToLearn?.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckIcon className="w-6 h-6 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="py-10">
          <div className="flex gap-2">
            <VideoIcon />
            <h2>{t("courses_list")}</h2>
          </div>
          <CoursesInProgram />
        </section>
      </div>
    </div>
  );
};

export default ProgramDetails;

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
import { motion } from "framer-motion";
import LearningPathEnrollButton from "@/features/UserHome/components/LearningPathEnrollButton";
import GetCertificateButton from "@/features/ContentLesson/components/GetCertificateButton";
import { fetchCertificateForLearningPath } from "@/features/ContentLesson/services/lessonsApis";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── ProgramDetails ───────────────────────────────────────────────────────────

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
      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-b from-primary to-[white] py-14 overflow-hidden">
        <IconsGroup className="absolute start-0 end-0 top-0 bottom-0 w-full h-full" />

        <div className="container flex justify-between max-md:flex-col-reverse max-md:gap-10 max-md:items-center">
          {/* Left copy */}
          <motion.div
            className="w-1/3 max-md:w-full"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.09 } } }}
          >
            <motion.h5 variants={fadeUp} className="font-bold mt-2">
              {t("program_title")}
            </motion.h5>

            <motion.h4 variants={fadeUp} className="text-2xl mt-2">
              {data?.title}
            </motion.h4>

            <motion.div variants={fadeUp} className="flex justify-between mt-4">
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
            </motion.div>

            {/* Action row: Save + Enroll */}

            <motion.div
              variants={fadeUp}
              className="relative mt-10 -ms-2 flex flex-wrap items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <SaveButton
                  id={+data.id}
                  isSaved={data?.isSaved ?? false}
                  messageForUnSaved={t("Save_Learning_unsaved")}
                  messageForSaved={t("Save_Learning_saved")}
                  saveFunction={saveProgramLearningPath}
                  invalidateQueriesKeys={[
                    { queryKey: ["getPackageDetails", programId] },
                  ]}
                />
                <span className="inline-block ms-2">Save Learning Path</span>
              </div>

              <LearningPathEnrollButton
                isEnrolled={data?.isEnrolled ?? false}
                programId={programId}
                queryKeyToReCall={["getPackageDetails"]}
              />
            </motion.div>
            {programId && (
              <GetCertificateButton
                className="mt-4 max-w-fit"
                courseId={programId}
                label={t("get_certificate") || "Get Learning Path Certificate"}
                fetchFunction={fetchCertificateForLearningPath}
              />
            )}
          </motion.div>

          {/* Rotating image */}
          <motion.div
            initial={{ opacity: 0, rotate: -40, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-[200px] h-[200px] max-md:w-[150px] max-md:h-[150px] me-[50px] group"
          >
            <div className="absolute inset-0 bg-[#FCB737] rounded-2xl -rotate-[30deg] shadow-xl transition-transform duration-300 group-hover:-rotate-[25deg]" />
            <div className="absolute inset-0 rounded-2xl overflow-hidden -rotate-[30deg] shadow-2xl transition-all duration-300 group-hover:-rotate-[25deg] group-hover:scale-105">
              <img
                src={data?.image ?? programImage}
                alt={t("program_image_alt")}
                className="w-full h-full object-cover rotate-[30deg] scale-125 transition-transform duration-300 group-hover:scale-150"
              />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-black/5 opacity-0 transition-opacity duration-300 pointer-events-none" />
          </motion.div>
        </div>
      </div>
      {/* ── Body ── */}
      <div className="container">
        {/* About */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
        >
          <SectionTitle textTitle={t("about_learning_program")} />
          <ExpandableText limit={2} text={data?.description ?? ""} />
        </motion.div>

        {/* What to learn */}
        <motion.section
          className="py-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        >
          <motion.div variants={fadeUp}>
            <SectionTitle textTitle={t("what_to_learn")} />
          </motion.div>
          <ul className="space-y-4 mt-4">
            {whatToLearn?.map((item, idx) => (
              <motion.li
                key={idx}
                custom={idx}
                variants={fadeUp}
                className="flex items-center gap-2"
              >
                <CheckIcon className="w-6 h-6 flex-shrink-0" />
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        {/* Courses list */}
        <motion.section
          className="py-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
        >
          <div className="flex gap-2">
            <VideoIcon />
            <h2>{t("courses_list")}</h2>
          </div>
          <CoursesInProgram />
        </motion.section>
      </div>
    </div>
  );
};

export default ProgramDetails;

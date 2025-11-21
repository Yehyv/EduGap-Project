import { motion, AnimatePresence } from "framer-motion";
import TitleLine from "@/assets/svgs/TitileLine.svg?react";
import ExamIcon from "@/assets/svgs/ExamIcon.svg?react";
import { useLanguage } from "@/shared/localization/useLanguage";

const LessonQuestions = () => {
  const { t } = useLanguage();
  const percent = 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border rounded-xl border-[#939393] min-h-[400px] shadow-sm bg-white"
    >
      {/* ===== Header Section ===== */}
      <div className="flex flex-col items-center pb-4">
        <h5 className="text-center text-md font-semibold py-5">
          {t("must_pass_70")}
        </h5>

        <motion.div
          key={percent}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-[300px] text-center text-[#FFAA00]"
        >
          1/10
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-5 px-4 flex items-center gap-2 text-sm text-secondary w-[300px] max-sm:w-full">
          <div className="w-full h-[3px] rounded-full bg-[#d4d4d4] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-[#FFAA00]"
            />
          </div>
        </div>
      </div>

      {/* ===== Questions header ===== */}
      <div className="flex items-center justify-between px-10">
        <div>
          <h4 className="font-semibold mb-0">{t("questions")}</h4>
          <TitleLine className={"w-14 -mt-2"} />
        </div>

        <h5 className="text-secondary text-sm mt-2">({t("question_types")})</h5>
      </div>

      {/* ===== Question Block ===== */}
      <AnimatePresence>
        <motion.div
          key={"question-1"}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.3 }}
          className="mx-10 mt-2"
        >
          <h5 className="flex gap-2 font-bold mb-4 items-center">
            <ExamIcon />
            <span>السؤال الرابع: ما هو الذكاء الاصطناعي؟</span>
          </h5>

          <div className="space-y-2 px-2">
            {/** Option 1 */}
            <motion.label
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 cursor-pointer bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <input type="radio" name="q4" className="h-4 w-4" value="opt1" />
              <span>تقليد الذكاء البشري</span>
            </motion.label>

            {/** Option 2 */}
            <motion.label
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 cursor-pointer bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <input type="radio" name="q4" className="h-4 w-4" value="opt2" />
              <span>العاب الفيديو</span>
            </motion.label>
            {/** Option 2 */}
            <motion.label
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 cursor-pointer bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <input type="radio" name="q4" className="h-4 w-4" value="opt2" />
              <span>العاب الفيديو</span>
            </motion.label>

            {/** Option 3 */}
            <motion.label
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 cursor-pointer bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <input type="radio" name="q4" className="h-4 w-4" value="opt3" />
              <span>الة حاسبة</span>
            </motion.label>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ===== Next Button ===== */}
      <div className="center my-12">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="center rounded-lg border border-secondary px-10 py-2 text-secondary cursor-pointer transition"
        >
          {t("next_question")}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LessonQuestions;

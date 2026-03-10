import { Loader2, Check, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  enrollLearningPath,
  unenrollLearningPath,
} from "@/features/UserHome/services/userHomeApis";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const LearningPathEnrollButton = ({
  isEnrolled,
  programId,
  queryKeyToReCall,
}: {
  isEnrolled: boolean;
  programId: string;
  queryKeyToReCall: string[];
}) => {
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutate: enroll, isPending: enrolling } = useMutation({
    mutationFn: () => enrollLearningPath(programId),
    onSuccess: () => {
      queryKeyToReCall?.map((q) => {
        queryClient.invalidateQueries({
          queryKey: [q],
        });
      });
      toast.success("You've successfully enrolled in this learning path!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    },
    onError: (error: Error) => {
      toast.error(error?.message ?? "Failed to enroll. Please try again.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    },
  });

  const { mutate: unenroll, isPending: unenrolling } = useMutation({
    mutationFn: () => unenrollLearningPath(programId),
    onSuccess: () => {
      queryKeyToReCall?.map((q) => {
        queryClient.invalidateQueries({
          queryKey: [q],
        });
      });
      setShowConfirm(false);
      toast.info("You've been unenrolled from this learning path.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    },
    onError: (error: Error) => {
      toast.error(error?.message ?? "Failed to unenroll. Please try again.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    },
  });

  const isPending = enrolling || unenrolling;

  if (isEnrolled) {
    return (
      <div className="relative inline-block">
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-64 z-50"
            >
              {/* Arrow */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-100 rotate-45" />
              <p className="text-sm font-semibold text-gray-800 mb-1 text-center">
                Leave this learning path?
              </p>
              <p className="text-xs text-gray-500 text-center mb-4">
                Your progress will be saved.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => unenroll()}
                  disabled={isPending}
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
                >
                  {unenrolling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Yes, leave"
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enrolled pill button */}
        <motion.button
          onClick={() => setShowConfirm((v) => !v)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="relative flex items-center gap-2 px-4 py-1.5 rounded-2xl font-bold text-sm bg-green-50 text-green-700 border-2 border-green-300 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all duration-300 group overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

          <motion.span
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative z-10"
          >
            <Check className="w-4 h-4 group-hover:hidden" strokeWidth={2.5} />
            <X
              className="w-4 h-4 hidden group-hover:block text-red-500"
              strokeWidth={2.5}
            />
          </motion.span>

          <span className="relative z-10 group-hover:hidden">Enrolled</span>
          <span className="relative z-10 hidden group-hover:inline">
            Unenroll
          </span>
        </motion.button>
      </div>
    );
  }

  return (
    <motion.button
      onClick={() => enroll()}
      disabled={isPending}
      whileHover={{ scale: isPending ? 1 : 1.03 }}
      whileTap={{ scale: isPending ? 1 : 0.97 }}
      className="relative flex items-center gap-2 px-4 py-1.5 rounded-2xl font-bold text-sm bg-secondary text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:brightness-105 transition-all duration-300 disabled:opacity-70 overflow-hidden group"
    >
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin relative z-10" />
          <span className="relative z-10">Enrolling…</span>
        </>
      ) : (
        <>
          <Plus className="w-4 h-4 relative z-10" strokeWidth={2.5} />
          <span className="relative z-10">Enroll Now</span>
        </>
      )}
    </motion.button>
  );
};

export default LearningPathEnrollButton;

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Award,
  CheckCircle2,
  Loader2,
  ExternalLink,
  X,
  AlertTriangle,
  ScrollText,
} from "lucide-react";

interface GetCertificateButtonProps {
  courseId: string | number;
  label?: string;
  className?: string;
  fetchFunction?: () => void;
}

// --- Particle burst ---
const Particles = ({ active }: { active: boolean }) => {
  const angles = Array.from({ length: 10 }, (_, i) => (i / 10) * 360);
  return (
    <AnimatePresence>
      {active &&
        angles.map((angle, i) => (
          <motion.span
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
            style={{
              top: "50%",
              left: "50%",
              background: i % 2 === 0 ? "#fbbf24" : "#ffffff",
            }}
            initial={{ opacity: 1, x: "-50%", y: "-50%", scale: 1 }}
            animate={{
              opacity: 0,
              x: `calc(-50% + ${Math.cos((angle * Math.PI) / 180) * 48}px)`,
              y: `calc(-50% + ${Math.sin((angle * Math.PI) / 180) * 48}px)`,
              scale: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.025 }}
          />
        ))}
    </AnimatePresence>
  );
};

// --- Shimmer bar ---
const ShimmerBar = () => (
  <span className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
    <motion.span
      className="absolute inset-y-0 w-1/3 bg-white/25 skew-x-[-20deg]"
      animate={{ x: ["-100%", "400%"] }}
      transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
    />
  </span>
);

const SuccessModal = ({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: () => void;
}) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 pointer-events-auto relative overflow-hidden"
            initial={{ scale: 0.85, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-emerald-400 rounded-t-2xl" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex justify-center mb-4 mt-2">
              <motion.div
                className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 16,
                  delay: 0.1,
                }}
              >
                <CheckCircle2 size={36} className="text-emerald-500" />
              </motion.div>
            </div>

            <motion.div
              className="text-center space-y-1.5 mb-5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-bold text-gray-800">
                Certificate Ready! 🎉
              </h3>
              <p className="text-sm text-gray-500">
                Your certificate has been generated successfully.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col gap-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
            >
              <button
                onClick={onNavigate}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-sm"
              >
                <ScrollText size={15} />
                View My Certificates
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// --- Error Modal ---
const ErrorModal = ({
  open,
  onClose,
  message,
}: {
  open: boolean;
  onClose: () => void;
  message: string;
}) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 pointer-events-auto relative overflow-hidden"
            initial={{ scale: 0.85, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-rose-500 rounded-t-2xl" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex justify-center mb-4 mt-2">
              <motion.div
                className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center"
                initial={{ scale: 0, rotate: 20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 16,
                  delay: 0.1,
                }}
              >
                <AlertTriangle size={34} className="text-red-500" />
              </motion.div>
            </div>

            <motion.div
              className="text-center space-y-1.5 mb-5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-bold text-gray-800">
                Couldn't Get Certificate
              </h3>
              <p className="text-sm text-gray-500 break-words">{message}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
            >
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// --- Main Component ---
const GetCertificateButton = ({
  courseId,
  label = "Get Certificate",
  className = "",
  fetchFunction,
}: GetCertificateButtonProps) => {
  const [showParticles, setShowParticles] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: () => fetchFunction(courseId),
    onSuccess: () => {
      setShowParticles(true);
      setDownloaded(true);
      setShowSuccessModal(true);
      setTimeout(() => setShowParticles(false), 700);
      setTimeout(() => setDownloaded(false), 3500);
    },
    onError: (error) => {
      const err = error as any;
      const msg =
        err?.response?.data?.message?.[0] ||
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";

      console.log("Certificate error:", msg);
      setErrorMessage(msg);
      setShowErrorModal(true);
    },
  });

  const buttonState = downloaded ? "success" : isPending ? "loading" : "idle";

  const buttonClasses = {
    idle: "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600",
    loading: "bg-amber-400 cursor-wait",
    success: "bg-emerald-500",
  };

  return (
    <>
      <div className={`space-y-2 ${className}`}>
        <motion.button
          onClick={() => !isPending && mutate()}
          disabled={isPending}
          whileTap={{ scale: isPending ? 1 : 0.97 }}
          whileHover={{ scale: isPending ? 1 : 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={`
            relative w-full flex items-center gap-3 rounded-xl px-5 py-2
            font-semibold text-white text-start overflow-hidden shadow-custom
            transition-colors duration-300 select-none
            ${buttonClasses[buttonState]}
          `}
        >
          {isPending && <ShimmerBar />}
          <Particles active={showParticles} />

          {/* Icon */}
          <motion.span
            key={buttonState}
            initial={{ opacity: 0, rotate: -20, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="inline-flex items-center justify-center w-5 h-5 shrink-0"
          >
            {buttonState === "success" ? (
              <CheckCircle2 size={20} />
            ) : buttonState === "loading" ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                className="inline-flex"
              >
                <Loader2 size={20} />
              </motion.span>
            ) : (
              <Award size={20} />
            )}
          </motion.span>

          {/* Label */}
          <motion.span
            key={`label-${buttonState}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            {buttonState === "success"
              ? "Certificate Ready!"
              : buttonState === "loading"
                ? "Fetching certificate…"
                : label}
          </motion.span>

          {/* Trailing icon on idle */}
          <AnimatePresence>
            {buttonState === "idle" && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 0.75, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <ExternalLink size={15} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <SuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onNavigate={() => {
          setShowSuccessModal(false);
          navigate("/my-certificates");
        }}
      />

      <ErrorModal
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </>
  );
};

export default GetCertificateButton;

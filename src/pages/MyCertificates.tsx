import { useState, useEffect } from "react";
import {
  Eye,
  Download,
  X,
  Award,
  AlertTriangle,
  Loader2,
  BookOpen,
  GitBranch,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/features/auth/context/UserContext";
import EduGapLogoUrl from "@/assets/svgs/EduGapWithShadow.svg?url";
import { useLanguage } from "@/shared/localization/useLanguage";
import {
  fetchContentCertificates,
  fetchLearningPathsCertificates,
  type ApiCertificate,
} from "@/features/ContentLesson/services/lessonsApis";

// ── Types ──────────────────────────────────────────────────────────────────
type TabId = "courses" | "paths";

interface PreviewState {
  dataURL: string;
  title: string;
  cert: ApiCertificate;
}

// ── Template image cache ───────────────────────────────────────────────────
let cachedTemplate: HTMLImageElement | null = null;

function loadTemplate(): Promise<HTMLImageElement | null> {
  if (cachedTemplate) return Promise.resolve(cachedTemplate);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/templates/Frame_160.png";
    img.onload = () => {
      cachedTemplate = img;
      resolve(img);
    };
    img.onerror = () => resolve(null);
  });
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// ── Certificate Canvas Generator ───────────────────────────────────────────
async function generateCertificateDataURL(
  cert: ApiCertificate,
  isArabic: boolean,
  companyLogoUrl?: string,
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1000;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const userName = cert.userCertificateName;
  const duration =
    parseFloat(cert.hours) > 0
      ? isArabic
        ? `${cert.hours} ساعة`
        : `${cert.hours} hours`
      : "—";
  const date = formatDate(cert.issueDate);

  const rtl = (
    text: string,
    x: number,
    y: number,
    font: string,
    color: string,
    align: CanvasTextAlign = "center",
  ) => {
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.direction = "rtl";
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  const ltr = (
    text: string,
    x: number,
    y: number,
    font: string,
    color: string,
    align: CanvasTextAlign = "center",
  ) => {
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.direction = "ltr";
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  const [template, instituteLogo, companyLogo] = await Promise.all([
    loadTemplate(),
    cert.instituteLogo ? loadImage(cert.instituteLogo) : Promise.resolve(null),
    companyLogoUrl ? loadImage(companyLogoUrl) : Promise.resolve(null),
  ]);

  const drawLogo = (
    img: HTMLImageElement,
    cx: number,
    cy: number,
    maxW: number,
    maxH: number,
  ) => {
    const scale = Math.min(maxW / img.width, maxH / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  };

  const drawText = isArabic ? rtl : ltr;

  const labels = isArabic
    ? {
        certifiedLabel: "شهادة معتمدة",
        awardedTo: "تمنح الشهادة الي الطالب",
        completed: "لإتمام دورة",
        durationLabel: "مدة الدورة:",
        dateLabel: "تاريخ الاصدار:",
        certNumberLabel: "رقم الشهادة",
      }
    : {
        certifiedLabel: "Certificate of Completion",
        awardedTo: "This certificate is awarded to",
        completed: "for completing the course",
        durationLabel: "Duration:",
        dateLabel: "Issue Date:",
        certNumberLabel: "Certificate Number",
      };

  if (template) {
    ctx.drawImage(template, 0, 0, 1600, 1000);
    drawText(
      labels.awardedTo,
      800,
      330,
      "400 32px 'Cairo','Tajawal',Arial",
      "#333333",
    );
    drawText(
      userName,
      800,
      440,
      "bold 88px 'Cairo','Tajawal',Arial",
      "#1a1a2e",
    );
    drawText(
      labels.completed,
      800,
      510,
      "400 30px 'Cairo','Tajawal',Arial",
      "#333333",
    );
    drawText(
      cert.title,
      800,
      590,
      "bold 50px 'Cairo','Tajawal',Arial",
      "#1a1a2e",
    );

    if (isArabic) {
      rtl(
        `${labels.durationLabel} ${duration}`,
        620,
        698,
        "bold 28px 'Cairo','Tajawal',Arial",
        "#1a1a2e",
      );
      rtl(
        labels.dateLabel,
        1100,
        698,
        "bold 28px 'Cairo','Tajawal',Arial",
        "#1a1a2e",
      );
      ltr(date, 940, 698, "28px 'Cairo','Tajawal',Arial", "#1a1a2e");
    } else {
      ltr(
        `${labels.durationLabel} ${duration}`,
        400,
        698,
        "bold 28px 'Cairo','Tajawal',Arial",
        "#1a1a2e",
        "left",
      );
      ltr(
        labels.dateLabel,
        900,
        698,
        "bold 28px 'Cairo','Tajawal',Arial",
        "#1a1a2e",
        "left",
      );
      ltr(date, 1080, 698, "28px 'Cairo','Tajawal',Arial", "#1a1a2e", "left");
    }

    drawText(
      labels.certNumberLabel,
      390,
      845,
      "bold 26px 'Cairo','Tajawal',Arial",
      "#C9A84C",
    );
    ltr(cert.serialNumber, 390, 892, "bold 32px Georgia,serif", "#1a1a2e");

    if (companyLogo) drawLogo(companyLogo, 1200, 905, 180, 90);
    if (instituteLogo) drawLogo(instituteLogo, 1390, 905, 160, 90);
  } else {
    // ── Fallback white certificate ─────────────────────────────────────────
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1600, 1000);

    ctx.strokeStyle = "#C9A84C";
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 1540, 940);
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.5;
    ctx.strokeRect(48, 48, 1504, 904);
    ctx.globalAlpha = 1;

    const drawCornerOrnament = (cx: number, cy: number) => {
      ctx.save();
      ctx.fillStyle = "#C9A84C";
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-10, -10, 20, 20);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#C9A84C";
      ctx.fill();
    };
    drawCornerOrnament(30, 30);
    drawCornerOrnament(1570, 30);
    drawCornerOrnament(30, 970);
    drawCornerOrnament(1570, 970);

    ctx.strokeStyle = "#C9A84C";
    ctx.lineWidth = 2;
    for (const [x1, x2] of [
      [600, 780],
      [820, 1000],
    ]) {
      ctx.beginPath();
      ctx.moveTo(x1, 30);
      ctx.lineTo(x2, 30);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x1, 970);
      ctx.lineTo(x2, 970);
      ctx.stroke();
    }
    [30, 970].forEach((y) => {
      ctx.save();
      ctx.fillStyle = "#C9A84C";
      ctx.translate(800, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-7, -7, 14, 14);
      ctx.restore();
    });

    const diagLine = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      alpha: number,
      w: number,
    ) => {
      ctx.save();
      ctx.strokeStyle = "#C9A84C";
      ctx.lineWidth = w;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    };
    diagLine(1455, 55, 1565, 165, 1.0, 3);
    diagLine(1425, 65, 1535, 175, 0.5, 2);
    diagLine(1395, 75, 1505, 185, 0.2, 1.5);
    diagLine(1485, 820, 1565, 900, 0.45, 2);
    diagLine(1505, 840, 1565, 900, 0.2, 1.5);

    if (companyLogo) {
      drawLogo(companyLogo, 1420, 105, 210, 120);
    } else {
      ltr("EduGap", 1420, 110, "bold 30px 'Cairo','Tajawal',Arial", "#C9A84C");
    }
    if (instituteLogo) drawLogo(instituteLogo, 1420, 232, 170, 95);

    const titleFont = isArabic
      ? "bold 72px 'Cairo','Tajawal',Arial"
      : "bold 60px Georgia,serif";
    drawText(labels.certifiedLabel, 830, 135, titleFont, "#C9A84C");

    ctx.strokeStyle = "#C9A84C";
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(100, 185);
    ctx.lineTo(1360, 185);
    ctx.stroke();
    ctx.globalAlpha = 1;

    drawText(
      labels.awardedTo,
      830,
      290,
      "400 30px 'Cairo','Tajawal',Arial",
      "#666666",
    );
    drawText(
      userName,
      830,
      418,
      "bold 84px 'Cairo','Tajawal',Arial",
      "#1a1a2e",
    );
    drawText(
      labels.completed,
      830,
      490,
      "400 28px 'Cairo','Tajawal',Arial",
      "#666666",
    );
    drawText(
      cert.title,
      830,
      580,
      "bold 48px 'Cairo','Tajawal',Arial",
      "#1a1a2e",
    );

    ctx.strokeStyle = "#d8d8d8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 620);
    ctx.lineTo(1360, 620);
    ctx.stroke();

    if (isArabic) {
      rtl(
        "مدة الدورة:",
        800,
        690,
        "bold 27px 'Cairo','Tajawal',Arial",
        "#C9A84C",
        "right",
      );
      rtl(
        duration,
        640,
        690,
        "bold 27px 'Cairo','Tajawal',Arial",
        "#1a1a2e",
        "right",
      );
      rtl(
        "تاريخ الاصدار:",
        1250,
        690,
        "bold 27px 'Cairo','Tajawal',Arial",
        "#C9A84C",
        "right",
      );
      ltr(date, 870, 690, "27px 'Cairo','Tajawal',Arial", "#1a1a2e", "left");
    } else {
      ltr(
        "Duration:",
        300,
        690,
        "bold 27px 'Cairo','Tajawal',Arial",
        "#C9A84C",
        "left",
      );
      ltr(
        duration,
        460,
        690,
        "27px 'Cairo','Tajawal',Arial",
        "#1a1a2e",
        "left",
      );
      ltr(
        "Issue Date:",
        800,
        690,
        "bold 27px 'Cairo','Tajawal',Arial",
        "#C9A84C",
        "left",
      );
      ltr(date, 960, 690, "27px 'Cairo','Tajawal',Arial", "#1a1a2e", "left");
    }

    ctx.strokeStyle = "#d8d8d8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 730);
    ctx.lineTo(1360, 730);
    ctx.stroke();

    drawText(
      labels.certNumberLabel,
      500,
      830,
      "bold 24px 'Cairo','Tajawal',Arial",
      "#C9A84C",
    );
    ltr(cert.serialNumber, 500, 878, "bold 30px Georgia,serif", "#1a1a2e");

    if (companyLogo) drawLogo(companyLogo, 1150, 898, 190, 95);
    if (instituteLogo) drawLogo(instituteLogo, 1360, 898, 160, 90);
  }

  return canvas.toDataURL("image/png");
}

// ── Animation Variants ─────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};
const headerVariants = {
  hidden: { opacity: 0, y: -24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const overlayVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};
const modalVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 30 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: { opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.2 } },
};
const tabContentVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// ── Certificate Grid ───────────────────────────────────────────────────────
function CertificateGrid({
  certificates,
  isArabic,
  ui,
  onShow,
  onDownload,
}: {
  certificates: ApiCertificate[];
  isArabic: boolean;
  ui: Record<string, string>;
  onShow: (cert: ApiCertificate) => void;
  onDownload: (cert: ApiCertificate) => void;
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto px-8 py-12 grid gap-7"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
    >
      {certificates.map((cert) => {
        const displayDate = formatDate(cert.issueDate);
        const displayHours =
          parseFloat(cert.hours) > 0 ? `${cert.hours} ${ui.hoursUnit}` : "—";

        return (
          <motion.div
            key={cert.certificateId}
            variants={cardVariants}
            whileHover={{ y: -8, transition: { duration: 0.25 } }}
            className="rounded-2xl overflow-hidden flex flex-col border border-border cursor-default bg-card shadow-md"
          >
            {/* Thumbnail */}
            <div className="h-44 flex flex-col items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background:
                    "repeating-linear-gradient(-45deg, #C9A84C 0px, #C9A84C 2px, transparent 2px, transparent 20px)",
                }}
              />
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 30% 40%, #C9A84C33, transparent 60%)",
                }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {cert.instituteLogo ? (
                <img
                  src={cert.instituteLogo}
                  alt="institute"
                  className="relative z-10 w-16 h-16 object-cover rounded-full border-2 border-amber-400"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <motion.span
                  className="text-5xl relative z-10"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  🎓
                </motion.span>
              )}
              <span className="text-xs font-mono font-bold tracking-widest relative z-10 text-amber-400">
                {ui.certifiedBadge}
              </span>
              <span className="text-xs text-gray-400 relative z-10 font-mono">
                {cert.serialNumber}
              </span>
            </div>

            {/* Body */}
            <div
              className="px-6 pt-5 pb-4 flex-1"
              dir={isArabic ? "rtl" : "ltr"}
            >
              <span className="text-xs font-mono tracking-widest px-3 py-1 rounded-full border inline-block mb-3 text-amber-500 border-amber-500/30 uppercase">
                {cert.language === "ar" ? "عربي" : "English"}
              </span>
              <h2 className="text-base font-bold text-card-foreground mb-1 leading-snug">
                {cert.title}
              </h2>
              <p className="text-sm text-secondary font-bold mb-1">EduGap</p>
              <div className="flex gap-4 text-xs text-black mt-2">
                <span>📅 {displayDate}</span>
                <span>⏱ {displayHours}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 pb-5 pt-3 border-t border-border">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onShow(cert)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-secondary-foreground border border-border bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                <Eye size={15} /> {ui.showBtn}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onDownload(cert)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-secondary-foreground font-medium hover:opacity-80 transition-opacity cursor-pointer bg-tertiary"
              >
                <Download size={15} /> {ui.downloadBtn}
              </motion.button>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────
function EmptyState({
  isArabic,
  ui,
  activeTab,
}: {
  isArabic: boolean;
  ui: Record<string, string>;
  activeTab: TabId;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center gap-6 py-24 px-6 text-center"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Decorative animated icon */}
      <div className="relative">
        <motion.div
          className="w-28 h-28 rounded-full flex items-center justify-center"
          style={{
            background:
              "radial-gradient(circle, #fef3c7 0%, rgba(253,230,138,0.2) 60%, transparent 100%)",
            boxShadow: "0 0 40px rgba(201,168,76,0.15)",
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {activeTab === "courses" ? (
            <BookOpen size={52} className="text-amber-400 opacity-50" />
          ) : (
            <GitBranch size={52} className="text-amber-400 opacity-50" />
          )}
        </motion.div>

        {/* Orbiting dots */}
        <motion.div
          className="absolute top-2 right-2 w-3 h-3 rounded-full bg-amber-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-3 left-1 w-2 h-2 rounded-full bg-amber-300"
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.3, 1] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      {/* Text */}
      <div className="max-w-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          {ui.emptyTitle}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">{ui.emptyDesc}</p>
      </div>

      {/* Decorative dashed divider */}
      <div className="flex items-center gap-3 mt-2 opacity-30">
        <div className="w-12 h-px bg-amber-400" />
        <Award size={14} className="text-amber-400" />
        <div className="w-12 h-px bg-amber-400" />
      </div>
    </motion.div>
  );
}

// ── Tab Panel ──────────────────────────────────────────────────────────────
function TabPanel({
  queryKey,
  fetchFn,
  isArabic,
  ui,
  onShow,
  onDownload,
  activeTab,
}: {
  queryKey: string[];
  fetchFn: () => Promise<{ data: { data: ApiCertificate[] } }>;
  isArabic: boolean;
  ui: Record<string, string>;
  onShow: (cert: ApiCertificate) => void;
  onDownload: (cert: ApiCertificate) => void;
  activeTab: TabId;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: fetchFn,
  });

  const certificates = data?.data?.data;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-5 py-24"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="text-amber-500" size={36} />
        </motion.div>
        {/* Fixed: was text-muted-foreground (too faint) → now clearly visible */}
        <p className="text-gray-700 text-sm font-medium">{ui.loadingText}</p>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto mt-16 flex items-center gap-4 px-6 py-5 rounded-xl border border-red-300 bg-red-50"
      >
        <AlertTriangle size={22} className="text-red-500 shrink-0" />
        {/* Fixed: was text-destructive on near-transparent bg → now solid readable red */}
        <p className="text-sm font-medium text-red-700">{ui.errorText}</p>
      </motion.div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────
  if (!certificates || certificates.length === 0) {
    return <EmptyState isArabic={isArabic} ui={ui} activeTab={activeTab} />;
  }

  return (
    <CertificateGrid
      certificates={certificates}
      isArabic={isArabic}
      ui={ui}
      onShow={onShow}
      onDownload={onDownload}
    />
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function MyCertificates() {
  const { user } = useUser();
  const { lang } = useLanguage();
  const isArabic = lang === "ar";

  // ── Tab state persisted in URL hash ──────────────────────────────────────
  const getInitialTab = (): TabId => {
    const hash = window.location.hash.replace("#", "");
    return hash === "paths" ? "paths" : "courses";
  };
  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  // Sync tab if user navigates with browser back/forward
  useEffect(() => {
    const onHashChange = () => setActiveTab(getInitialTab());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [generating, setGenerating] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleShow = async (cert: ApiCertificate) => {
    setGenerating(true);
    try {
      const url = await generateCertificateDataURL(
        cert,
        isArabic,
        EduGapLogoUrl,
      );
      setPreview({ dataURL: url, title: cert.title, cert });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (cert: ApiCertificate) => {
    setGenerating(true);
    try {
      const url = await generateCertificateDataURL(
        cert,
        isArabic,
        EduGapLogoUrl,
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cert.serialNumber}_Certificate.png`;
      a.click();
    } finally {
      setGenerating(false);
    }
  };

  // ── UI labels ──────────────────────────────────────────────────────────────
  const ui = isArabic
    ? {
        subtitle: "إنجازاتي",
        title: "الشهادات",
        welcome: "مرحباً بعودتك،",
        earned: "— بياناتك الموثوقة المكتسبة",
        certifiedBadge: "شهادة معتمدة",
        showBtn: "عرض",
        downloadBtn: "تنزيل",
        downloadCert: "تنزيل الشهادة",
        hoursUnit: "ساعة",
        loadingText: "جاري تحميل الشهادات…",
        errorText: "فشل تحميل الشهادات، حاول مرة أخرى.",
        tabCourses: "الدورات",
        tabPaths: "مسارات التعلم",
        emptyTitle: "لا توجد شهادات بعد",
        emptyDesc:
          "أكمل دورة أو مسار تعلم للحصول على شهادتك الأولى وإضافتها هنا.",
      }
    : {
        subtitle: "My Achievements",
        title: "Certificates",
        welcome: "Welcome back,",
        earned: "— your earned credentials",
        certifiedBadge: "Certified",
        showBtn: "Show",
        downloadBtn: "Download",
        downloadCert: "Download Certificate",
        hoursUnit: "hours",
        loadingText: "Loading certificates…",
        errorText: "Failed to load certificates. Please try again.",
        tabCourses: "Courses",
        tabPaths: "Learning Paths",
        emptyTitle: "No Certificates Yet",
        emptyDesc:
          "Complete a course or learning path to earn your first certificate and have it appear here.",
      };

  return (
    <div
      className="min-h-screen text-gray-100"
      style={{ fontFamily: "Georgia, serif" }}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* ── Header ── */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="show"
        className="px-6 py-12 text-center"
      >
        <motion.span
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "0.3em" }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-xs text-secondary font-mono block mb-4 uppercase tracking-widest"
        >
          {ui.subtitle}
        </motion.span>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-3"
        >
          <Award className="text-secondary" size={36} />
          <h1 className="text-5xl font-normal text-foreground">{ui.title}</h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-black"
        >
          {ui.welcome} <span className="font-bold">{user?.userName}</span>{" "}
          {ui.earned}
        </motion.p>
      </motion.div>

      {/* ── Tabs ── */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex gap-1 pt-2" role="tablist">
            {/* Courses Tab */}
            <motion.button
              role="tab"
              aria-selected={activeTab === "courses"}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleTabChange("courses")}
              className={`relative flex items-center gap-2 px-6 py-3.5 text-sm font-medium rounded-t-xl transition-colors cursor-pointer ${
                activeTab === "courses"
                  ? "text-amber-500 bg-card border border-b-0 border-border"
                  : " bg-gray-100 text-black hover:text-foreground"
              }`}
            >
              <BookOpen size={16} />
              {ui.tabCourses}
              {activeTab === "courses" && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                />
              )}
            </motion.button>

            {/* Learning Paths Tab */}
            <motion.button
              role="tab"
              aria-selected={activeTab === "paths"}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleTabChange("paths")}
              className={`relative flex items-center gap-2 px-6 py-3.5 text-sm font-medium rounded-t-xl transition-colors cursor-pointer ${
                activeTab === "paths"
                  ? "text-amber-500 bg-card border border-b-0 border-border"
                  : " bg-gray-100 text-black hover:text-foreground"
              }`}
            >
              <GitBranch size={16} />
              {ui.tabPaths}
              {activeTab === "paths" && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Generating overlay ── */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Loader2 className="text-secondary" size={48} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabContentVariants}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          {activeTab === "courses" ? (
            <TabPanel
              queryKey={["content-certificates", lang]}
              fetchFn={() => fetchContentCertificates(lang as "ar" | "en")}
              isArabic={isArabic}
              ui={ui}
              onShow={handleShow}
              onDownload={handleDownload}
              activeTab={activeTab}
            />
          ) : (
            <TabPanel
              queryKey={["package-certificates", lang]}
              fetchFn={() =>
                fetchLearningPathsCertificates(lang as "ar" | "en")
              }
              isArabic={isArabic}
              ui={ui}
              onShow={handleShow}
              onDownload={handleDownload}
              activeTab={activeTab}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Preview Modal ── */}
      <AnimatePresence>
        {preview && (
          <motion.div
            key="overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
            style={{
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(10px)",
            }}
            onClick={() => setPreview(null)}
          >
            <motion.div
              key="modal"
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="w-full max-w-4xl flex flex-col rounded-2xl overflow-hidden border border-border bg-card shadow-2xl"
              style={{ maxHeight: "90vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex bg-primary items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
                <h3 className="text-card-foreground text-base font-semibold flex items-center gap-2">
                  <Award size={18} className="text-secondary" />
                  {preview.title}
                </h3>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setPreview(null)}
                  className="text-muted-foreground hover:text-card-foreground transition-colors p-1.5 rounded-lg bg-secondary cursor-pointer"
                >
                  <X size={18} />
                </motion.button>
              </div>

              <div className="overflow-y-auto flex-1 min-h-0">
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  src={preview.dataURL}
                  alt={preview.title}
                  className="w-full block"
                  style={{ imageRendering: "crisp-edges" }}
                />
              </div>

              <div className="px-6 py-4 border-t border-border flex-shrink-0 bg-primary">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDownload(preview.cert)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-secondary-foreground font-medium hover:opacity-85 transition-opacity text-sm cursor-pointer bg-tertiary"
                >
                  <Download size={16} /> {ui.downloadCert}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

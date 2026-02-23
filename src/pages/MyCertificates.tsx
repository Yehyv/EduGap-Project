import { useState } from "react";
import { Eye, Download, X, Award, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/features/auth/context/UserContext";
// Import as URL for canvas drawing + as React component for UI
import EduGapLogoUrl from "@/assets/svgs/EduGapWithShadow.svg?url";
import LogoSm from "@/assets/svgs/EduGapWithShadow.svg?react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Certificate {
  id: number;
  title: string;
  issuer: string;
  date: string;
  duration: string;
  category: string;
  certificateNumber: string;
  badge: string;
}

interface PreviewState {
  dataURL: string;
  title: string;
  cert: Certificate;
}

// ── Dummy data ─────────────────────────────────────────────────────────────
const DUMMY_CERTIFICATES: Certificate[] = [
  {
    id: 1,
    title: "تطوير الويب المتقدم والبرمجة الكاملة",
    issuer: "EduGap",
    date: "11/11/2025",
    duration: "20 ساعة",
    category: "تطوير الويب",
    certificateNumber: "EG-00012345",
    badge: "💻",
  },
  {
    id: 2,
    title: "تصميم واجهات المستخدم",
    issuer: "EduGap",
    date: "03/03/2025",
    duration: "15 ساعة",
    category: "تصميم",
    certificateNumber: "EG-00012346",
    badge: "🎨",
  },
  {
    id: 3,
    title: "هندسة الحوسبة السحابية",
    issuer: "EduGap",
    date: "20/11/2024",
    duration: "30 ساعة",
    category: "الحوسبة السحابية",
    certificateNumber: "EG-00012347",
    badge: "☁️",
  },
  {
    id: 4,
    title: "إدارة المشاريع الرشيقة",
    issuer: "EduGap",
    date: "08/08/2024",
    duration: "12 ساعة",
    category: "إدارة المشاريع",
    certificateNumber: "EG-00012348",
    badge: "⚡",
  },
];

// ── Template image cache ───────────────────────────────────────────────────
let cachedTemplate: HTMLImageElement | null = null;

function loadTemplate(): Promise<HTMLImageElement | null> {
  if (cachedTemplate) return Promise.resolve(cachedTemplate);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    // Place Frame_160.png in /public/templates/Frame_160.png
    img.src = "/templates/Frame_160.png";
    img.onload = () => {
      cachedTemplate = img;
      resolve(img);
    };
    // On error → resolve with null so we fall back to drawn template
    img.onerror = () => resolve(null);
  });
}

// ── Generic image loader ───────────────────────────────────────────────────
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

// ── Certificate Canvas Generator ───────────────────────────────────────────
async function generateCertificateDataURL(
  cert: Certificate,
  userName: string,
  userLogoUrl?: string, // user.logo URL from API
  companyLogoUrl?: string, // EduGap SVG passed as EduGapLogoUrl
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1000;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // ── Helper: RTL Arabic text ────────────────────────────────────────────
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

  // ── Helper: LTR text ──────────────────────────────────────────────────
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

  // 1. Load template + both logos in parallel
  const [template, userLogo, companyLogo] = await Promise.all([
    loadTemplate(),
    userLogoUrl ? loadImage(userLogoUrl) : Promise.resolve(null),
    companyLogoUrl ? loadImage(companyLogoUrl) : Promise.resolve(null),
  ]);

  // ── Helper: draw a logo image centred in a box, preserving aspect ratio ──
  const drawLogo = (
    img: HTMLImageElement,
    cx: number, // centre x
    cy: number, // centre y
    maxW: number,
    maxH: number,
  ) => {
    const scale = Math.min(maxW / img.width, maxH / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  };

  if (template) {
    // ── REAL TEMPLATE PATH ────────────────────────────────────────────────
    ctx.drawImage(template, 0, 0, 1600, 1000);

    // "تمنح الشهادة الي الطالب"
    rtl(
      "تمنح الشهادة الي الطالب",
      800,
      330,
      "400 32px 'Cairo','Tajawal',Arial",
      "#333333",
    );

    // Student name — large bold
    rtl(userName, 800, 440, "bold 88px 'Cairo','Tajawal',Arial", "#1a1a2e");

    // "لإتمام دورة"
    rtl("لإتمام دورة", 800, 510, "400 30px 'Cairo','Tajawal',Arial", "#333333");

    // Course title
    rtl(cert.title, 800, 590, "bold 50px 'Cairo','Tajawal',Arial", "#1a1a2e");

    // Duration
    rtl(
      `مدة الدورة: ${cert.duration}`,
      620,
      698,
      "bold 28px 'Cairo','Tajawal',Arial",
      "#1a1a2e",
    );

    // Issue date label
    rtl(
      "تاريخ الاصدار:",
      1100,
      698,
      "bold 28px 'Cairo','Tajawal',Arial",
      "#1a1a2e",
    );
    ltr(cert.date, 940, 698, "28px 'Cairo','Tajawal',Arial", "#1a1a2e");

    // Certificate number label — gold
    rtl(
      "رقم الشهادة",
      390,
      845,
      "bold 26px 'Cairo','Tajawal',Arial",
      "#C9A84C",
    );
    ltr(cert.certificateNumber, 390, 892, "bold 32px Georgia,serif", "#1a1a2e");

    // ── Logos at bottom-right (where the template has logo placeholders) ──
    // Company logo (EduGap) — right side ~x:1200, y:900
    if (companyLogo) drawLogo(companyLogo, 1200, 905, 180, 90);
    // User / institution logo — next to company logo
    if (userLogo) drawLogo(userLogo, 1390, 905, 160, 90);
  } else {
    // ── FALLBACK: clean white certificate with elegant gold frame ─────────

    // White base
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1600, 1000);

    // ── Outer gold border ─────────────────────────────────────────────────
    ctx.strokeStyle = "#C9A84C";
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 1540, 940);

    // ── Inner thin gold border ────────────────────────────────────────────
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.5;
    ctx.strokeRect(48, 48, 1504, 904);
    ctx.globalAlpha = 1;

    // ── Corner ornaments — small gold squares rotated 45° ─────────────────
    const drawCornerOrnament = (cx: number, cy: number) => {
      ctx.save();
      ctx.fillStyle = "#C9A84C";
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-10, -10, 20, 20);
      ctx.restore();
      // Outer dot
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#C9A84C";
      ctx.fill();
    };
    drawCornerOrnament(30, 30);
    drawCornerOrnament(1570, 30);
    drawCornerOrnament(30, 970);
    drawCornerOrnament(1570, 970);

    // ── Top & bottom center ornament lines ────────────────────────────────
    // Top center
    ctx.strokeStyle = "#C9A84C";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(600, 30);
    ctx.lineTo(780, 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(820, 30);
    ctx.lineTo(1000, 30);
    ctx.stroke();
    // Small diamond at top center
    ctx.save();
    ctx.fillStyle = "#C9A84C";
    ctx.translate(800, 30);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-7, -7, 14, 14);
    ctx.restore();
    // Bottom center mirror
    ctx.beginPath();
    ctx.moveTo(600, 970);
    ctx.lineTo(780, 970);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(820, 970);
    ctx.lineTo(1000, 970);
    ctx.stroke();
    ctx.save();
    ctx.fillStyle = "#C9A84C";
    ctx.translate(800, 970);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-7, -7, 14, 14);
    ctx.restore();

    // ── Right decorative diagonal lines (top-right corner) ────────────────
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
    // Bottom-right mirror
    diagLine(1485, 820, 1565, 900, 0.45, 2);
    diagLine(1505, 840, 1565, 900, 0.2, 1.5);

    // ── TOP-RIGHT LOGOS — clean on white ──────────────────────────────────
    if (companyLogo) {
      drawLogo(companyLogo, 1420, 105, 210, 120);
    } else {
      ctx.font = "bold 30px 'Cairo','Tajawal',Arial";
      ctx.fillStyle = "#C9A84C";
      ctx.textAlign = "center";
      ctx.direction = "ltr";
      ctx.fillText("EduGap", 1420, 110);
    }
    if (userLogo) {
      drawLogo(userLogo, 1420, 232, 170, 95);
    }

    // ── "شهادة معتمدة" — gold title ───────────────────────────────────────
    ctx.font = "bold 72px 'Cairo','Tajawal',Arial";
    ctx.fillStyle = "#C9A84C";
    ctx.textAlign = "center";
    ctx.direction = "rtl";
    ctx.fillText("شهادة معتمدة", 830, 135);

    // ── Thin gold separator under title ───────────────────────────────────
    ctx.strokeStyle = "#C9A84C";
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(100, 185);
    ctx.lineTo(1360, 185);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // ── Dynamic text ──────────────────────────────────────────────────────
    rtl(
      "تمنح الشهادة الي الطالب",
      830,
      290,
      "400 30px 'Cairo','Tajawal',Arial",
      "#666666",
    );
    rtl(userName, 830, 418, "bold 84px 'Cairo','Tajawal',Arial", "#1a1a2e");
    rtl("لإتمام دورة", 830, 490, "400 28px 'Cairo','Tajawal',Arial", "#666666");
    rtl(cert.title, 830, 580, "bold 48px 'Cairo','Tajawal',Arial", "#1a1a2e");

    // ── Mid divider ───────────────────────────────────────────────────────
    ctx.strokeStyle = "#d8d8d8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 620);
    ctx.lineTo(1360, 620);
    ctx.stroke();

    // ── Duration & date ───────────────────────────────────────────────────
    ctx.font = "bold 27px 'Cairo','Tajawal',Arial";
    ctx.fillStyle = "#C9A84C";
    ctx.textAlign = "right";
    ctx.direction = "rtl";
    ctx.fillText("مدة الدورة:", 800, 690);
    ctx.fillStyle = "#1a1a2e";
    ctx.fillText(cert.duration, 640, 690);

    ctx.fillStyle = "#C9A84C";
    ctx.fillText("تاريخ الاصدار:", 1250, 690);
    ctx.font = "27px 'Cairo','Tajawal',Arial";
    ctx.fillStyle = "#1a1a2e";
    ctx.textAlign = "left";
    ctx.direction = "ltr";
    ctx.fillText(cert.date, 870, 690);

    // ── Bottom divider ────────────────────────────────────────────────────
    ctx.strokeStyle = "#d8d8d8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 730);
    ctx.lineTo(1360, 730);
    ctx.stroke();

    // ── Certificate number ────────────────────────────────────────────────
    ctx.font = "bold 24px 'Cairo','Tajawal',Arial";
    ctx.fillStyle = "#C9A84C";
    ctx.textAlign = "center";
    ctx.direction = "rtl";
    ctx.fillText("رقم الشهادة", 500, 830);
    ctx.font = "bold 30px Georgia,serif";
    ctx.fillStyle = "#1a1a2e";
    ctx.textAlign = "center";
    ctx.direction = "ltr";
    ctx.fillText(cert.certificateNumber, 500, 878);

    // ── Bottom-right logos ─────────────────────────────────────────────────
    if (companyLogo) drawLogo(companyLogo, 1150, 898, 190, 95);
    if (userLogo) drawLogo(userLogo, 1360, 898, 160, 90);
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

// ── Main Component ─────────────────────────────────────────────────────────
export default function MyCertificates() {
  const loading = false;
  const error = null;
  const data = DUMMY_CERTIFICATES;
  const { user } = useUser();

  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleShow = async (cert: Certificate) => {
    setGenerating(true);
    try {
      const url = await generateCertificateDataURL(
        cert,
        user?.userName ?? "اسم الطالب",
        user?.logo ?? undefined, // user logo from context
        EduGapLogoUrl, // company logo (EduGap SVG as URL)
      );
      setPreview({ dataURL: url, title: cert.title, cert });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (cert: Certificate) => {
    setGenerating(true);
    try {
      const url = await generateCertificateDataURL(
        cert,
        user?.userName ?? "اسم الطالب",
        user?.logo ?? undefined,
        EduGapLogoUrl,
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cert.certificateNumber}_Certificate.png`;
      a.click();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div
      className="min-h-screen text-gray-100"
      style={{ fontFamily: "Georgia, serif" }}
    >
      {/* ── Header ── */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="show"
        className="border-b border-secondary/20 px-6 py-16 text-center"
      >
        <motion.span
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "0.3em" }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-xs text-secondary font-mono block mb-4 uppercase tracking-widest"
        >
          My Achievements
        </motion.span>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-3"
        >
          <Award className="text-secondary" size={36} />
          <h1 className="text-5xl font-normal text-foreground">Certificates</h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-black"
        >
          Welcome back, <span className="font-bold">{user?.userName}</span> —
          your earned credentials
        </motion.p>
      </motion.div>

      {/* ── Loading ── */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center gap-5 py-24"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <Loader2 className="text-secondary" size={36} />
          </motion.div>
          <p className="text-muted-foreground text-sm">Loading certificates…</p>
        </motion.div>
      )}

      {/* ── Error ── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto mt-16 flex items-center gap-4 px-6 py-5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive"
        >
          <AlertTriangle size={22} />
          <p className="text-sm">
            Failed to load certificates. Please try again later.
          </p>
        </motion.div>
      )}

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

      {/* ── Grid ── */}
      {!loading && !error && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-6xl mx-auto px-8 py-12 grid gap-7"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {data.map((cert) => (
            <motion.div
              key={cert.id}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="rounded-2xl overflow-hidden flex flex-col border border-border cursor-default bg-card shadow-md"
            >
              {/* Thumbnail — mimics the real template's dark + gold style */}
              <div className="h-44 flex flex-col items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                {/* Gold diagonal lines like template */}
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
                <motion.span
                  className="text-5xl relative z-10"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {cert.badge}
                </motion.span>
                <span className="text-xs font-mono font-bold tracking-widest relative z-10 text-amber-400">
                  شهادة معتمدة
                </span>
                <span className="text-xs text-gray-400 relative z-10 font-mono">
                  {cert.certificateNumber}
                </span>
              </div>

              {/* Body */}
              <div className="px-6 pt-5 pb-4 flex-1" dir="rtl">
                <span className="text-xs font-mono tracking-widest px-3 py-1 rounded-full border inline-block mb-3 text-amber-500 border-amber-500/30">
                  {cert.category}
                </span>
                <h2 className="text-base font-bold text-card-foreground mb-1 leading-snug">
                  {cert.title}
                </h2>
                <p className="text-sm text-secondary font-bold mb-1">
                  {cert.issuer}
                </p>
                <div className="flex gap-4 text-xs text-black mt-2">
                  <span>📅 {cert.date}</span>
                  <span>⏱ {cert.duration}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 px-6 pb-5 pt-3 border-t border-border">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShow(cert)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-secondary-foreground border border-border bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer"
                >
                  <Eye size={15} /> Show
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDownload(cert)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-secondary-foreground font-medium hover:opacity-80 transition-opacity cursor-pointer bg-tertiary"
                >
                  <Download size={15} /> Download
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

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
              {/* Modal Header — fixed, never scrolls */}
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

              {/* Scrollable body */}
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

              {/* Download button — fixed at bottom, never scrolls */}
              <div className="px-6 py-4 border-t border-border flex-shrink-0 bg-primary">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDownload(preview.cert)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-secondary-foreground font-medium hover:opacity-85 transition-opacity text-sm cursor-pointer bg-tertiary"
                >
                  <Download size={16} /> Download Certificate
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

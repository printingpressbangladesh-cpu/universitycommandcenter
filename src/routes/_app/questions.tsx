import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import type { QuestionBankItem } from "@/lib/types";
import {
  deleteQuestion,
  getQuestionDownloadUrl,
  incrementQuestionDownloads,
  listQuestions,
  uploadQuestion,
} from "@/lib/supabase/questionsApi";
import type { QuestionFilters } from "@/lib/supabase/questionsApi";
import {
  Archive,
  BookOpen,
  Download,
  FileQuestion,
  Filter,
  Globe,
  Lock,
  Plus,
  Search,
  Tag,
  Trash2,
  Upload,
  X,
  FileText,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/questions")({
  component: QuestionBankPage,
  head: () => ({ meta: [{ title: "Question Bank · University Command Center" }] }),
});

const EXAM_TYPES = ["midterm", "final", "quiz", "practice"] as const;
type ExamType = (typeof EXAM_TYPES)[number];

const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  midterm: "Midterm",
  final: "Final",
  quiz: "Quiz",
  practice: "Practice",
};

const EXAM_TYPE_COLORS: Record<ExamType, string> = {
  midterm: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  final: "bg-red-500/10 text-red-400 border-red-500/20",
  quiz: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  practice: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

// ─── Upload Modal ───────────────────────────────────────────────────────────

interface UploadModalProps {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function UploadModal({ userId, onClose, onSuccess }: UploadModalProps) {
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [semesterLabel, setSemesterLabel] = useState("");
  const [examType, setExamType] = useState<ExamType>("midterm");
  const [year, setYear] = useState(CURRENT_YEAR);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t)) setTags((p) => [...p, t]);
    setTagInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error("Please select a file to upload"); return; }
    if (!courseCode || !courseName || !title) {
      toast.error("Course code, course name and title are required");
      return;
    }
    setUploading(true);
    try {
      await uploadQuestion(userId, {
        courseCode,
        courseName,
        semesterLabel: semesterLabel || undefined,
        examType,
        year,
        title,
        description: description || undefined,
        isPublic,
        tags,
        file,
      });
      toast.success("Question paper uploaded successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error((err as Error).message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-strong w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-border/60 animate-fade-in-up overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Upload Question Paper</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Share past exam questions with your peers</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Course Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Course Code *</label>
              <input
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                placeholder="e.g. CSE-1101"
                required
                className="h-10 w-full rounded-xl border border-border/60 bg-secondary/40 px-3 text-sm outline-none focus:border-ring transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Year *</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="h-10 w-full rounded-xl border border-border/60 bg-secondary/40 px-3 text-sm outline-none focus:border-ring cursor-pointer transition appearance-none"
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Course Name *</label>
            <input
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g. Data Structures & Algorithms"
              required
              className="h-10 w-full rounded-xl border border-border/60 bg-secondary/40 px-3 text-sm outline-none focus:border-ring transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exam Type *</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as ExamType)}
                className="h-10 w-full rounded-xl border border-border/60 bg-secondary/40 px-3 text-sm outline-none focus:border-ring cursor-pointer transition appearance-none"
              >
                {EXAM_TYPES.map((t) => (
                  <option key={t} value={t}>{EXAM_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Semester Label</label>
              <input
                value={semesterLabel}
                onChange={(e) => setSemesterLabel(e.target.value)}
                placeholder="e.g. Fall 2023"
                className="h-10 w-full rounded-xl border border-border/60 bg-secondary/40 px-3 text-sm outline-none focus:border-ring transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CSE 1101 Midterm — Fall 2023"
              required
              className="h-10 w-full rounded-xl border border-border/60 bg-secondary/40 px-3 text-sm outline-none focus:border-ring transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief notes about this paper (optional)..."
              rows={2}
              className="w-full rounded-xl border border-border/60 bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-ring transition resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags</label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Add tag and press Enter"
                className="h-9 flex-1 rounded-xl border border-border/60 bg-secondary/40 px-3 text-sm outline-none focus:border-ring transition"
              />
              <button
                type="button"
                onClick={addTag}
                className="h-9 rounded-xl bg-secondary px-3 text-sm hover:bg-secondary/80 transition cursor-pointer"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs text-primary border border-primary/20">
                    #{t}
                    <button type="button" onClick={() => setTags((p) => p.filter((x) => x !== t))} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-secondary/20 p-4">
            <div className="flex items-center gap-3">
              {isPublic ? <Globe className="h-5 w-5 text-emerald-400" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
              <div>
                <div className="text-sm font-medium">{isPublic ? "Public" : "Private"}</div>
                <div className="text-[11px] text-muted-foreground">
                  {isPublic ? "Visible to all students in the bank" : "Only visible to you"}
                </div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              onClick={() => setIsPublic((p) => !p)}
              className={`relative inline-flex h-6 w-11 rounded-full transition-colors cursor-pointer focus:outline-none ${isPublic ? "bg-gradient-primary" : "bg-secondary"}`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 translate-y-1 rounded-full bg-white shadow transition-transform ${isPublic ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          {/* File Upload */}
          <div
            className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition cursor-pointer ${
              file ? "border-primary/60 bg-primary/5" : "border-border/60 hover:border-primary/40 hover:bg-secondary/20"
            }`}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  if (f.size > 20 * 1024 * 1024) {
                    toast.error("File size exceeds 20MB limit");
                    return;
                  }
                  setFile(f);
                }
              }}
            />
            {file ? (
              <>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{formatBytes(file.size)}</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute top-3 right-3 rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/60">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">Drop file here or click to browse</div>
                  <div className="text-xs text-muted-foreground mt-0.5">PDF, DOC, DOCX, images, ZIP — max 20 MB</div>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-border/60 text-sm font-medium text-muted-foreground hover:bg-secondary transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="flex-1 h-11 rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Uploading…
                </span>
              ) : "Upload Paper"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Question Card ───────────────────────────────────────────────────────────

interface QuestionCardProps {
  item: QuestionBankItem;
  isOwner: boolean;
  onDelete: (item: QuestionBankItem) => void;
  onDownload: (item: QuestionBankItem) => void;
}

function QuestionCard({ item, isOwner, onDelete, onDownload }: QuestionCardProps) {
  const colorCls = EXAM_TYPE_COLORS[item.examType] ?? "bg-secondary/60 text-muted-foreground border-border/60";

  return (
    <article className="glass-strong group relative flex flex-col justify-between rounded-3xl p-6 hover-lift animate-fade-in-up border border-border/40 hover:border-border/80 transition-all">
      {/* Top */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${colorCls}`}>
              {EXAM_TYPE_LABELS[item.examType]}
            </span>
            <span className="rounded-md bg-secondary/60 border border-border/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {item.courseCode}
            </span>
            <span className="text-[10px] text-muted-foreground">{item.year}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {isOwner && (
              <button
                type="button"
                onClick={() => onDelete(item)}
                title="Delete paper"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <h2 className="mt-3 text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{item.courseName}</p>

        {item.description && (
          <p className="mt-2 text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">{item.description}</p>
        )}

        {item.semesterLabel && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Archive className="h-3 w-3" />
            {item.semesterLabel}
          </div>
        )}

        {item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {item.tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-0.5 rounded-md bg-secondary/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                <Tag className="h-2.5 w-2.5" />
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-4">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            {item.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            {item.isPublic ? "Public" : "Private"}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {item.downloadsCount}
          </span>
          <span>{formatBytes(item.fileSize)}</span>
        </div>
        <button
          type="button"
          onClick={() => onDownload(item)}
          className="flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </button>
      </div>
      <div className="mt-2 text-[10px] text-muted-foreground/60">{formatDate(item.createdAt)}</div>
    </article>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function QuestionBankPage() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [items, setItems] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [searchQ, setSearchQ] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterExamType, setFilterExamType] = useState<ExamType | "">("");
  const [filterYear, setFilterYear] = useState<number | "">("");
  const [filterMine, setFilterMine] = useState(false);

  const activeFiltersCount = [filterCourse, filterExamType, filterYear, filterMine].filter(Boolean).length;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const filters: QuestionFilters = {};
      if (filterCourse) filters.courseCode = filterCourse;
      if (filterExamType) filters.examType = filterExamType;
      if (filterYear) filters.year = Number(filterYear);
      const rows = await listQuestions(filters);
      setItems(rows);
    } catch {
      toast.error("Failed to load question bank");
    } finally {
      setLoading(false);
    }
  }, [filterCourse, filterExamType, filterYear]);

  useEffect(() => { void load(); }, [load]);

  // Client-side: text search + mine filter
  const filtered = useMemo(() => {
    let result = [...items];
    if (filterMine && userId) result = result.filter((i) => i.userId === userId);
    if (searchQ) {
      const q = searchQ.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.courseName.toLowerCase().includes(q) ||
          i.courseCode.toLowerCase().includes(q) ||
          (i.description ?? "").toLowerCase().includes(q) ||
          i.tags.some((t) => t.includes(q))
      );
    }
    return result;
  }, [items, filterMine, searchQ, userId]);

  const handleDownload = async (item: QuestionBankItem) => {
    try {
      const url = await getQuestionDownloadUrl(item.filePath);
      window.open(url, "_blank", "noopener,noreferrer");
      await incrementQuestionDownloads(item.id);
      // Optimistically bump download count in UI
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, downloadsCount: i.downloadsCount + 1 } : i))
      );
    } catch {
      toast.error("Could not generate download link");
    }
  };

  const handleDelete = async (item: QuestionBankItem) => {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      await deleteQuestion(item);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success("Question paper deleted");
    } catch {
      toast.error("Failed to delete paper");
    }
  };

  const clearFilters = () => {
    setFilterCourse("");
    setFilterExamType("");
    setFilterYear("");
    setFilterMine(false);
    setSearchQ("");
  };

  const stats = useMemo(() => ({
    total: items.length,
    public: items.filter((i) => i.isPublic).length,
    mine: items.filter((i) => i.userId === userId).length,
    totalDownloads: items.reduce((s, i) => s + i.downloadsCount, 0),
  }), [items, userId]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <header className="glass-strong relative overflow-hidden rounded-3xl p-8">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-primary opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute -left-6 -bottom-8 h-32 w-32 rounded-full bg-[color:var(--cyan)] opacity-10 blur-2xl pointer-events-none" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
                <FileQuestion className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">Question Bank</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Browse, upload and share previous exam question papers
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {/* Stats */}
            <div className="flex items-center gap-5">
              {[
                { label: "Papers", value: stats.total },
                { label: "Public", value: stats.public },
                { label: "Downloads", value: stats.totalDownloads },
                { label: "My Uploads", value: stats.mine },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="text-xl font-semibold text-gradient">{value}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
            {userId && (
              <button
                type="button"
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 rounded-2xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Upload Paper
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Search & Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search by title, course, tags…"
            className="h-10 w-full rounded-xl border border-border/60 bg-secondary/40 pl-9 pr-4 text-sm outline-none focus:border-ring transition"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((p) => !p)}
          className={`flex items-center gap-2 h-10 rounded-xl border px-4 text-sm font-medium transition cursor-pointer ${
            activeFiltersCount > 0
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border/60 bg-secondary/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>

        {userId && (
          <button
            type="button"
            onClick={() => setFilterMine((p) => !p)}
            className={`flex items-center gap-2 h-10 rounded-xl border px-4 text-sm font-medium transition cursor-pointer ${
              filterMine
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/60 bg-secondary/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            My Uploads
          </button>
        )}

        {(activeFiltersCount > 0 || searchQ) && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1.5 h-10 rounded-xl border border-destructive/30 bg-destructive/5 px-4 text-sm text-destructive hover:bg-destructive/10 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="glass-strong rounded-2xl p-4 border border-border/60 animate-fade-in-up">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Course Code</label>
              <input
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value.toUpperCase())}
                placeholder="e.g. CSE-1101"
                className="h-9 w-full rounded-xl border border-border/60 bg-secondary/40 px-3 text-sm outline-none focus:border-ring transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Exam Type</label>
              <select
                value={filterExamType}
                onChange={(e) => setFilterExamType(e.target.value as ExamType | "")}
                className="h-9 w-full rounded-xl border border-border/60 bg-secondary/40 px-3 text-sm outline-none focus:border-ring cursor-pointer transition appearance-none"
              >
                <option value="">All types</option>
                {EXAM_TYPES.map((t) => (
                  <option key={t} value={t}>{EXAM_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Year</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value ? Number(e.target.value) : "")}
                className="h-9 w-full rounded-xl border border-border/60 bg-secondary/40 px-3 text-sm outline-none focus:border-ring cursor-pointer transition appearance-none"
              >
                <option value="">All years</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results label */}
      {!loading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filtered.length === 0 ? "No papers found" : `${filtered.length} paper${filtered.length === 1 ? "" : "s"} found`}
          </p>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-strong h-56 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-strong rounded-3xl p-16 text-center space-y-5 border border-border/40">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-secondary/60">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1.5">
            <p className="text-base font-semibold">
              {searchQ || activeFiltersCount > 0 ? "No papers match your search" : "No question papers yet"}
            </p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {searchQ || activeFiltersCount > 0
                ? "Try broadening your filters or search query."
                : "Be the first to upload a past exam paper and help your peers!"}
            </p>
          </div>
          {!searchQ && activeFiltersCount === 0 && userId && (
            <button
              type="button"
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-5 py-2 text-sm font-medium hover:bg-secondary/80 transition cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              Upload first paper
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <QuestionCard
              key={item.id}
              item={item}
              isOwner={item.userId === userId}
              onDelete={handleDelete}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && userId && (
        <UploadModal
          userId={userId}
          onClose={() => setShowUpload(false)}
          onSuccess={load}
        />
      )}
    </div>
  );
}

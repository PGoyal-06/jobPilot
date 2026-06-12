"use client";

import { CloudUpload, ExternalLink, Sparkles, Wand2 } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadResume } from "@/actions/profile";
import type { ProfileFormData } from "@/actions/profile";

type Props = {
  initialHasResume?: boolean;
  onExtract?: (data: Partial<ProfileFormData>) => void;
};

export function ResumeSection({ initialHasResume = false, onExtract }: Props) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [hasResume, setHasResume] = useState(initialHasResume);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">(
    initialHasResume ? "success" : "idle",
  );
  const [uploadMessage, setUploadMessage] = useState(
    initialHasResume ? "Resume already uploaded." : "",
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractStatus, setExtractStatus] = useState<"idle" | "success" | "error">("idle");
  const [extractMessage, setExtractMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateStatus, setGenerateStatus] = useState<"idle" | "success" | "error">("idle");
  const [generateMessage, setGenerateMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleExtract() {
    setIsExtracting(true);
    setExtractStatus("idle");
    setExtractMessage("");
    try {
      const res = await fetch("/api/resume/extract", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setExtractStatus("error");
        setExtractMessage(json.error ?? "Extraction failed. Please try again.");
      } else {
        onExtract?.(json.data);
        setExtractStatus("success");
        setExtractMessage("Profile fields populated from your resume. Review and save.");
      }
    } catch {
      setExtractStatus("error");
      setExtractMessage("Extraction failed. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setGenerateStatus("idle");
    setGenerateMessage("");
    try {
      const res = await fetch("/api/resume/generate", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setGenerateStatus("error");
        setGenerateMessage(json.error ?? "Generation failed. Please try again.");
      } else {
        setGenerateStatus("success");
        setGenerateMessage("Resume generated. Review it using the View resume link.");
        setHasResume(true);
        router.refresh();
      }
    } catch {
      setGenerateStatus("error");
      setGenerateMessage("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  async function processFile(selected: File) {
    if (selected.type !== "application/pdf") {
      setUploadStatus("error");
      setUploadMessage("Only PDF files are accepted.");
      return;
    }
    if (selected.size > 8 * 1024 * 1024) {
      setUploadStatus("error");
      setUploadMessage("File exceeds the 8 MB limit.");
      return;
    }

    setFile(selected);
    setIsUploading(true);
    setUploadStatus("idle");
    setUploadMessage("");

    const formData = new FormData();
    formData.append("resume", selected);

    const result = await uploadResume(formData);

    setIsUploading(false);
    if (result.success) {
      setUploadStatus("success");
      setUploadMessage("Resume uploaded successfully.");
      setHasResume(true);
    } else {
      setUploadStatus("error");
      setUploadMessage(result.error ?? "Upload failed.");
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) processFile(dropped);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <h2 className="text-base font-semibold leading-6 text-text-primary">
        Resume
      </h2>
      <p className="mt-1 text-sm font-normal leading-5 text-text-secondary">
        Upload an existing resume to auto-fill the profile, or generate a new
        tailored one from your details below.
      </p>

      <div
        className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
          isDragging
            ? "border-accent bg-accent-muted"
            : "border-border bg-surface-secondary"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface">
          <CloudUpload className="h-5 w-5 text-text-muted" />
        </div>

        {isUploading ? (
          <p className="mt-3 text-sm font-medium text-text-secondary">
            Uploading…
          </p>
        ) : file || hasResume ? (
          <div className="mt-3 flex flex-col items-center gap-1">
            <p className="text-sm font-medium text-text-primary">
              {file ? file.name : "resume.pdf"}
            </p>
            <a
              href="/api/resume/view"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              View resume
            </a>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm font-medium text-text-primary">
              Click to upload or drag and drop
            </p>
            <p className="mt-1 text-xs font-normal text-text-muted">
              PDF formatting only. Maximum file size 8MB
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          onClick={(e) => e.stopPropagation()}
        />

        <button
          type="button"
          disabled={isUploading}
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          className="mt-4 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? "Uploading…" : "Select Resume"}
        </button>
      </div>

      {uploadStatus === "success" && (
        <p className="mt-2 text-sm text-success-foreground">{uploadMessage}</p>
      )}
      {uploadStatus === "error" && (
        <p className="mt-2 text-sm text-error">{uploadMessage}</p>
      )}

      {hasResume && (
        <div className="mt-3 flex flex-col gap-1">
          <button
            type="button"
            disabled={isExtracting || isUploading}
            onClick={handleExtract}
            className="flex items-center gap-2 self-start rounded-md border border-accent bg-accent-muted px-4 py-2 text-sm font-medium text-accent hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4" />
            {isExtracting ? "Extracting…" : "Extract from Resume"}
          </button>
          {extractStatus === "success" && (
            <p className="text-sm text-success-foreground">{extractMessage}</p>
          )}
          {extractStatus === "error" && (
            <p className="text-sm text-error">{extractMessage}</p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-normal text-text-secondary">
            Need a fresh document based on the fields below?
          </p>
          <button
            type="button"
            disabled={isGenerating || isUploading}
            onClick={handleGenerate}
            className="flex shrink-0 items-center gap-2 rounded-md bg-success px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-success-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? "Generating…" : "Generate Resume from Profile"}
          </button>
        </div>
        {generateStatus === "success" && (
          <p className="text-sm text-success-foreground">{generateMessage}</p>
        )}
        {generateStatus === "error" && (
          <p className="text-sm text-error">{generateMessage}</p>
        )}
      </div>
    </div>
  );
}

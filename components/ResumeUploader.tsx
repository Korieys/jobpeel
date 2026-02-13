"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { uploadResume } from "@/lib/storage";
import { toast } from "sonner";

interface ResumeUploaderProps {
    onResumeParsed: (text: string) => void;
}

export function ResumeUploader({ onResumeParsed }: ResumeUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    }, []);

    const { user } = useAuth();

    const processFile = async (file: File) => {
        setError(null);
        if (file.type !== "application/pdf") {
            setError("Please upload a PDF file.");
            return;
        }

        setIsUploading(true);
        setUploadedFileName(file.name);

        // Create local preview URL
        const objUrl = URL.createObjectURL(file);
        setPreviewUrl(objUrl);

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Parallel execution: Upload to Storage (if logged in) AND Analyze
            const uploadPromise = user ? uploadResume(user.uid, file) : Promise.resolve(null);

            const [uploadResult, response] = await Promise.all([
                uploadPromise,
                fetch("/api/analyze-resume", {
                    method: "POST",
                    body: formData,
                })
            ]);

            if (uploadResult) {
                toast.success("Resume saved to your account");
            }

            if (!response.ok) {
                throw new Error("Failed to parse resume");
            }

            const data = await response.json();
            if (data.text) {
                onResumeParsed(data.text);
            } else {
                throw new Error("No text found in resume");
            }
        } catch (err: any) {
            console.error(err);
            setError("Failed to process resume. Please try again.");
            toast.error("Processing failed", { description: err.message });
            setUploadedFileName(null);
            setPreviewUrl(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full">
            <div
                className={cn(
                    "relative border border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden group",
                    isDragging
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-white/10 bg-black/20 hover:bg-black/40 hover:border-white/20",
                    uploadedFileName ? "border-green-500/50 bg-green-500/5 group-hover:bg-green-500/10" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("resume-upload")?.click()}
            >
                <input
                    type="file"
                    id="resume-upload"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleChange}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
                        <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest animate-pulse">Extracting...</p>
                    </div>
                ) : uploadedFileName ? (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-10 h-10 text-green-500 mb-4 shadow-lg shadow-green-900/20" />
                        <p className="font-bold text-sm text-white">Resume Uploaded</p>
                        <p className="text-xs text-zinc-500 mt-1 font-mono max-w-[200px] truncate">{uploadedFileName}</p>
                        <div className="flex gap-4 mt-4">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest hover:text-white transition-colors z-10 relative">Replace</span>
                            {previewUrl && (
                                <span
                                    className="text-[10px] text-orange-500 font-bold uppercase tracking-widest hover:text-orange-400 transition-colors z-10 relative"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(previewUrl, "_blank");
                                    }}
                                >
                                    View PDF
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center group-hover:scale-105 transition-transform duration-300">
                        <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-4 border border-white/5 shadow-lg group-hover:border-white/10">
                            <Upload className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                        <p className="font-bold text-sm mb-2 text-zinc-300">Upload PDF</p>
                        <p className="text-xs text-zinc-600 mb-1">Drag & drop or click</p>
                    </div>
                )}

                {isDragging && !uploadedFileName && (
                    <div className="absolute inset-0 bg-orange-600/10 backdrop-blur-[2px] flex items-center justify-center">
                        <p className="text-orange-500 font-bold text-sm uppercase tracking-widest">Drop Element Here</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 mt-4 text-red-400 bg-red-950/20 p-3 rounded-lg text-xs font-bold border border-red-500/20">
                    <AlertCircle className="w-4 h-4" />
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}

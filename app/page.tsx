"use client";

import { useState, useRef, useEffect, useActionState } from "react";
import {
  Upload,
  Sparkles,
  Copy,
  RefreshCw,
  X,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { generateCaption, GenerateState } from "./actions";
import Image from "next/image";

const initialState: GenerateState = {
  success: false,
  message: "",
};

export default function Home() {
  const [state, formAction, isPending] = useActionState(
    generateCaption,
    initialState,
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Manually set the file to the hidden input
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyToClipboard = () => {
    if (state.data) {
      navigator.clipboard.writeText(state.data);
      setCopied(true);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-7xl glass-panel rounded-3xl p-6 md:p-8 relative z-10 min-h-[85vh] flex flex-col">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-linear-to-br from-purple-500 to-blue-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Kasih<span className="text-gradient">Kepsyen</span>
            </h1>
          </div>
          <div className="text-sm text-gray-400 font-medium">
            Powered by Gemini AI
          </div>
        </header>

        <form
          action={formAction}
          className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* LEFT COLUMN - IMAGE UPLOAD */}
          <div className="flex flex-col gap-6">
            <div
              className={`flex-1 border-2 border-dashed rounded-2xl transition-all duration-300 flex flex-col items-center justify-center p-8 relative overflow-hidden group ${preview ? "border-purple-500/50 bg-black/40" : "border-white/10 hover:border-purple-500/30 hover:bg-white/5"}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                name="image"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />

              {preview ? (
                <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
                  <Image
                    src={preview}
                    alt="Upload preview"
                    fill
                    className="object-contain pointer-events-none"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeImage();
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-500/80 rounded-full text-white z-30 transition-colors backdrop-blur-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-4 pointer-events-none">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-200">
                      Upload Poster/Foto
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Drag & drop atau klik untuk browse
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Hint */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-200 flex gap-3 items-start">
              <ImageIcon className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                Bot akan menganalisis teks dan visual dalam gambar secara
                otomatis untuk membuat caption yang relevan.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN - FORM & RESULT */}
          <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
            {/* If has result, show result view, else show form */}
            {state.success && state.data && !isPending ? (
              <div className="flex flex-col gap-4 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">
                    Caption Result
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => window.location.reload()} // Simple reset for now
                      className="px-4 py-2 text-sm rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Reset
                    </button>
                  </div>
                </div>

                <div className="flex-1 glass-input rounded-xl p-6 relative group overflow-hidden">
                  <textarea
                    readOnly
                    className="w-full h-full bg-transparent border-none focus:ring-0 resize-none text-gray-200 leading-relaxed custom-scrollbar text-sm md:text-base outline-none"
                    value={state.data}
                  />
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-purple-500 text-white transition-all backdrop-blur-md border border-white/10"
                  >
                    {copied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Remake Section */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <label className="text-sm font-medium text-gray-400">
                    Kurang pas? Revisi yuk (Opsional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="instructions"
                      placeholder="Contoh: Buat lebih pendek, ganti emoji..."
                      className="flex-1 px-4 py-2 glass-input rounded-lg text-sm text-white placeholder-gray-500"
                    />
                    {/* Hidden inputs to keep state for remake - simplified approach for now would be needed in a real complex app state, but sending form again works */}
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isPending ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        "Remake"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">
                      Platform
                    </label>
                    <select
                      name="platform"
                      className="w-full px-4 py-3 glass-input rounded-xl text-white appearance-none cursor-pointer"
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Twitter/X">Twitter/X</option>
                      <option value="TikTok">TikTok</option>
                      <option value="WhatsApp">WhatsApp</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">
                      Tone / Gaya
                    </label>
                    <select
                      name="tone"
                      className="w-full px-4 py-3 glass-input rounded-xl text-white appearance-none cursor-pointer"
                    >
                      <option value="Professional & Formal">
                        Formal & Profesional
                      </option>
                      <option value="Santai & Friendly">
                        Santai & Friendly
                      </option>
                      <option value="Hype & Exciting">Hype & Semangat</option>
                      <option value="Puitis & Aesthetic">
                        Puitis & Aesthetic
                      </option>
                      <option value="Lucu & Receh">Lucu & Receh</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">
                    Jenis Postingan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      "Event",
                      "Announcement",
                      "Recruitment",
                      "Educational",
                      "Fun Fact",
                      "Promotion",
                    ].map((type) => (
                      <label key={type} className="cursor-pointer">
                        <input
                          type="radio"
                          name="postType"
                          value={type}
                          className="peer hidden"
                          defaultChecked={type === "Event"}
                        />
                        <div className="px-3 py-2 text-xs md:text-sm text-center rounded-lg border border-white/10 bg-white/5 text-gray-400 peer-checked:bg-purple-600 peer-checked:text-white peer-checked:border-purple-500 transition-all hover:bg-white/10">
                          {type}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">
                      Detail (Opsional)
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Judul / Headline Acara"
                      className="w-full px-4 py-3 glass-input rounded-xl text-white placeholder-gray-600 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="date"
                      placeholder="Tanggal (cth: 21 Jan)"
                      className="w-full px-4 py-3 glass-input rounded-xl text-white placeholder-gray-600 text-sm"
                    />
                    <input
                      type="text"
                      name="contact"
                      placeholder="Contact Person"
                      className="w-full px-4 py-3 glass-input rounded-xl text-white placeholder-gray-600 text-sm"
                    />
                  </div>

                  <input
                    type="text"
                    name="link"
                    placeholder="Link Pendaftaran / Info"
                    className="w-full px-4 py-3 glass-input rounded-xl text-white placeholder-gray-600 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">
                    Call to Action (CTA)
                  </label>
                  <select
                    name="ctaFocus"
                    className="w-full px-4 py-3 glass-input rounded-xl text-white appearance-none cursor-pointer"
                  >
                    <option value="Daftar Sekarang">
                      Ajak Daftar (Register Now)
                    </option>
                    <option value="Like & Share">
                      Engagement (Like & Share)
                    </option>
                    <option value="Save for Later">Save Post</option>
                    <option value="Komentar">Ajak Diskusi di Komentar</option>
                    <option value="Hubungi Kami">Hubungi Lebih Lanjut</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-sm text-gray-300">
                    Sembunyikan Emoji
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="hideEmoji"
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="pt-4 mt-auto">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-4 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-purple-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                  >
                    {isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Generate Caption
                      </>
                    )}
                  </button>
                  {state.message && !state.success && (
                    <p className="text-red-400 text-sm mt-3 text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                      {state.message}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

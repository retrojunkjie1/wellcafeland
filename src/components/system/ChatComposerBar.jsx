// Chat composer for typed, recorded, and image-supported messages.
import React, { useRef, useState } from "react";
import { useSheet } from "@/context/SheetContext";
import { ArrowUp, Camera, ImagePlus, Loader2, Mic, X } from "lucide-react";

const ChatComposerBar = ({
  value, onChange, onSend, onMic, onImageChange, attachment, onFaceScan,
  disabled = false, placeholder = "Ask anything", isSending = false, inputRef,
}) => {
  const { sheetOpen } = useSheet();
  const fileInputRef = useRef(null);
  const [attachmentError, setAttachmentError] = useState("");
  const canSend = Boolean(value?.trim() || attachment) && !disabled && !isSending;

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) onSend?.();
    }
  };

  const handleImageFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setAttachmentError("");
    if (!file.type.startsWith("image/")) {
      setAttachmentError("Choose an image file such as JPEG, PNG, or WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAttachmentError("That image is over 10 MB. Choose a smaller image.");
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close?.();
      let dataUrl = canvas.toDataURL("image/jpeg", 0.82);
      if (dataUrl.length > 2_000_000) dataUrl = canvas.toDataURL("image/jpeg", 0.65);
      if (dataUrl.length > 2_000_000) {
        setAttachmentError("This image is still too large to send. Choose a smaller image.");
        return;
      }
      onImageChange?.({ dataUrl, name: file.name, mimeType: "image/jpeg" });
    } catch (error) {
      console.warn("Could not prepare the selected image:", error);
      setAttachmentError("This image could not be opened. Try another image file.");
    }
  };

  return (
    <div
      data-wc-composer="1"
      className={`min-w-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 shadow-lg backdrop-blur-xl transition-opacity ${sheetOpen ? "pointer-events-none opacity-0" : ""}`}
    >
      {attachment && (
        <div className="mb-2 flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/50 p-2">
          <img src={attachment.dataUrl} alt="Selected image preview" className="h-14 w-14 rounded-lg object-cover" />
          <span className="min-w-0 flex-1 truncate text-sm text-white/75">{attachment.name || "Image attached"}</span>
          <button type="button" onClick={() => onImageChange?.(null)} aria-label="Remove attached image" title="Remove image" className="grid h-10 w-10 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
      {attachmentError && <p className="mb-2 text-sm text-rose-200" role="alert">{attachmentError}</p>}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageFile} className="sr-only" tabIndex={-1} aria-label="Choose an image" />
      <div className="flex min-w-0 items-end gap-2">
        {onImageChange && (
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled || isSending} aria-label="Attach an image" title="Attach an image" className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.08] text-white/80 transition hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 disabled:opacity-40">
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        {onMic && (
          <button type="button" onClick={onMic} disabled={disabled || isSending} aria-label="Record a voice message" title="Record a voice message" className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.08] text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 disabled:opacity-40">
            <Mic className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        {onFaceScan && (
          <button type="button" onClick={onFaceScan} disabled={disabled} aria-label="Camera check-in" title="Camera check-in" className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.08] text-white transition hover:bg-white/15 disabled:opacity-40">
            <Camera className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        <textarea
          ref={inputRef}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          className="min-h-[44px] max-h-32 min-w-0 flex-1 resize-none rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3 text-base text-white placeholder:text-slate-400 transition-colors focus:border-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-200/20 disabled:opacity-60"
        />
        <button type="button" onClick={() => canSend && onSend?.()} disabled={!canSend} aria-label="Send message" title={canSend ? "Send message" : isSending ? "Sending message" : "Type a message or attach an image"} className="grid h-11 min-w-[52px] flex-shrink-0 place-items-center rounded-xl border border-amber-200 bg-amber-300 text-slate-950 shadow-[0_4px_16px_rgba(252,211,77,0.2)] transition hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-100 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/45 disabled:shadow-none">
          {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>
      <p className="mt-2 px-1 text-[11px] text-white/40">Enter to send · Shift+Enter for a new line · You can attach an image or record your voice</p>
    </div>
  );
};

export default ChatComposerBar;

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Cropper from "react-easy-crop";
import {
  Download,
  Upload,
  Type,
  Move,
  Image as ImageIcon,
  Check,
  Share2,
} from "lucide-react";

const TEMPLATE_WIDTH = 2160;
const TEMPLATE_HEIGHT = 2160;
const TEMPLATE_SRC = "/Template bg.jpg";

const CONFIG = {
  ovalX: 529,
  ovalY: 985,
  ovalRadiusX: 296,
  ovalRadiusY: 395,
  nameX: 200,
  nameY: 1520,
  nameSize: 55,
  nameColor: "#FFFFFF",
  desigX: 200,
  desigY: 1580,
  desigSize: 45,
  desigColor: "#FFFFFF",
};

export default function EidCardGenerator() {
  const [photoSrc, setPhotoSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [name, setName] = useState("Abdullah Shafwan Taif");
  const [designation, setDesignation] = useState("senior executive");
  const canvasRef = useRef(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setPhotoSrc(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Debounced render
  useEffect(() => {
    let timeoutId;
    const renderCard = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      // Load template
      const templateImg = new window.Image();
      templateImg.src = TEMPLATE_SRC;
      await new Promise((resolve) => {
        templateImg.onload = resolve;
      });

      ctx.clearRect(0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);
      ctx.drawImage(templateImg, 0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);

      // Draw photo if cropped
      if (photoSrc && croppedAreaPixels) {
        const photoImg = new window.Image();
        photoImg.src = photoSrc;
        await new Promise((resolve) => {
          photoImg.onload = resolve;
        });

        const { x, y, width, height } = croppedAreaPixels;

        const rx = CONFIG.ovalRadiusX;
        const ry = CONFIG.ovalRadiusY;
        const cx = CONFIG.ovalX;
        const cy = CONFIG.ovalY;
        const sh = ry - rx; // straight height half

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy - sh, rx, Math.PI, 0, false);
        ctx.lineTo(cx + rx, cy + sh);
        ctx.arc(cx, cy + sh, rx, 0, Math.PI, false);
        ctx.lineTo(cx - rx, cy - sh);
        ctx.closePath();
        ctx.clip();

        // Map the cropped 1:1 area to fill the bounding box of the ellipse
        // Since croppedAreaPixels is square and ellipse is portrait, drawing it
        // into the ellipse's bounding box will stretch it.
        // We will adjust the aspect ratio in the cropper UI.
        ctx.drawImage(
          photoImg,
          x,
          y,
          width,
          height,
          CONFIG.ovalX - CONFIG.ovalRadiusX,
          CONFIG.ovalY - CONFIG.ovalRadiusY,
          CONFIG.ovalRadiusX * 2,
          CONFIG.ovalRadiusY * 2,
        );
        // Draw Border
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 8; // Border width for high-res output
        ctx.stroke();

        ctx.restore();
      }

      // Draw Name
      ctx.fillStyle = CONFIG.nameColor;
      ctx.font = `bold ${CONFIG.nameSize}px Inter, "Segoe UI", sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      if (name) ctx.fillText(name, CONFIG.nameX, CONFIG.nameY);

      // Draw Designation
      ctx.fillStyle = CONFIG.desigColor;
      ctx.font = `500 ${CONFIG.desigSize}px Inter, "Segoe UI", sans-serif`;
      if (designation) ctx.fillText(designation, CONFIG.desigX, CONFIG.desigY);
    };

    timeoutId = setTimeout(() => {
      renderCard();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [photoSrc, croppedAreaPixels, name, designation]);

  useEffect(() => {
    // Increment view count on load
    const trackView = async () => {
      try {
        await fetch("/api/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "view" }),
        });
      } catch (err) {
        console.error("Failed to track view:", err);
      }
    };
    trackView();
  }, []);

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Track download first
    try {
      await fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "download", name, designation }),
      });
    } catch (err) {
      console.error("Failed to track download:", err);
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    const link = document.createElement("a");
    link.download = `Eid-Greetings-${name.replace(/\s+/g, "-")}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (navigator.share) {
      canvas.toBlob(
        async (blob) => {
          if (!blob) return;
          const file = new File(
            [blob],
            `Eid-Greetings-${name.replace(/\s+/g, "-")}.jpg`,
            { type: "image/jpeg" },
          );

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: "Eid Greetings",
                text: "Wishing you a blessed Eid-ul-Fitr!",
              });
            } catch (err) {
              if (err.name === "AbortError") {
                console.log("Share canceled");
              } else {
                console.error("Share failed:", err);
              }
            }
          } else {
            alert(
              "Your browser doesn't support sharing this image directly. Please download it first.",
            );
          }
        },
        "image/jpeg",
        0.95,
      );
    } else {
      alert(
        "Your browser doesn't support direct sharing. Please download the image first.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar Controls */}
      <div className="w-full md:w-80 lg:w-96 bg-white border-r border-neutral-200 overflow-y-auto flex-shrink-0 flex flex-col hidden-scrollbar h-fit md:h-screen">
        <div className="p-6 border-b border-neutral-100 bg-white sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Betopia Eid Card
          </h1>
          <p className="text-sm text-neutral-500">
            Create customized greetings cards instantly.
          </p>
        </div>

        <div className="p-6 space-y-6 flex-grow">
          {/* Main Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Employee Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow outline-none text-neutral-900"
                placeholder="Ex. Abdullah Shafwan Taif"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Designation
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow outline-none text-neutral-900"
                placeholder="Ex. senior executive"
              />
            </div>

            {!photoSrc && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Photo Upload
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-lg hover:border-orange-400 transition-colors bg-neutral-50 relative">
                  <div className="space-y-1 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-neutral-400" />
                    <div className="flex text-sm text-neutral-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500 px-2 py-1"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-neutral-500">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Photo Cropper UI */}
          {photoSrc && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <Move className="w-4 h-4 text-orange-500" /> Adjust Photo
                Position
              </h2>
              <div className="relative w-full h-64 bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 shadow-inner">
                <Cropper
                  image={photoSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={CONFIG.ovalRadiusX / CONFIG.ovalRadiusY}
                  cropShape="rect"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2 flex justify-between">
                  <span>Zoom Level</span>
                  <span>{Number(zoom).toFixed(1)}x</span>
                </label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Download Button moved to canvas area */}
      </div>

      {/* Preview Canvas Area */}
      <div className="flex-1 overflow-hidden relative bg-[#f8f9fa] flex items-center justify-center p-8 bg-grid-pattern">
        {/* Subtle grid pattern background for preview area */}
        <div
          className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>

        <div className="relative z-10 w-full max-w-2xl h-full flex flex-col items-center justify-center pb-8 overflow-y-auto hidden-scrollbar">
          <div className="relative mx-auto w-full aspect-square bg-white shadow-sm rounded-xl overflow-hidden ring-1 ring-neutral-200 transition-all duration-300">
            {/* The actual off-screen canvas rendering high res */}
            <canvas
              ref={canvasRef}
              width={TEMPLATE_WIDTH}
              height={TEMPLATE_HEIGHT}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
            {/* Placeholder state if needed, though canvas does load right away */}
            {!photoSrc && (
              <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-neutral-100 flex items-center gap-2 animate-bounce">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
                <span className="text-sm font-medium text-neutral-700">
                  Upload Your Photo...
                </span>
              </div>
            )}
          </div>

          <div className="mt-8 w-full max-w-lg mx-auto shrink-0 flex items-center justify-between gap-4">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 px-6 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-medium rounded-md transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-sm"
            >
              <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              <span className="hidden sm:inline">Download High-Res Card</span>
              <span className="sm:hidden">Download</span>
            </button>

            <button
              onClick={handleShare}
              className="py-3 px-6 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-medium rounded-md transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-sm shrink-0"
              title="Share"
            >
              <span>Share</span>
              <Share2 className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

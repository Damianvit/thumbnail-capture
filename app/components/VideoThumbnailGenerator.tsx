"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
    videoUrl: string;
};

export default function VideoThumbnailGenerator() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [captured, setCaptured] = useState(false);
    const [timestamp, setTimestamp] = useState(5); // default is 5s
    const [manualCapture, setManualCapture] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setVideoUrl(url);
        setThumbnail(null); // Reset thumbnail if new video is uploaded
    };
    useEffect(() => {
        if (!videoUrl) return;

        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            if (video.duration >= 5) {
                video.currentTime = 5;
            } else {
                video.currentTime = Math.floor(video.duration / 2);
            }
        };

        const handleSeeked = () => {
            if (manualCapture || !captured) {
                captureFrame();
                setCaptured(true);
                setManualCapture(false);
            }
        };

        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("seeked", handleSeeked);

        return () => {
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("seeked", handleSeeked);
        };
    }, [videoUrl, captured, manualCapture]);

    const captureFrame = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Target size for Open Graph and WhatsApp meta: 1200 x 630
        const targetWidth = 1200;
        const targetHeight = 630;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const scale = Math.min(
            video.videoWidth / targetWidth,
            video.videoHeight / targetHeight
        );

        const drawWidth = targetWidth * scale;
        const drawHeight = targetHeight * scale;

        const offsetX = (video.videoWidth - drawWidth) / 2;
        const offsetY = (video.videoHeight - drawHeight) / 2;

        ctx.drawImage(
            video,
            offsetX,
            offsetY,
            drawWidth,
            drawHeight,
            0,
            0,
            targetWidth,
            targetHeight
        );

        const imageData = canvas.toDataURL("image/jpeg", 0.9);
        setThumbnail(imageData);
    };

    const handleCustomCapture = () => {
        const video = videoRef.current;
        if (!video || isNaN(timestamp)) return;

        // Clamp to video duration
        const safeTimestamp = Math.min(timestamp, video.duration);
        setManualCapture(true);
        video.currentTime = safeTimestamp;
    };

    // This function allows capturing the current frame while the video is playing.
    const handleAnalogCapture = () => {
        captureFrame();
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            <input type="file" accept="video/*" onChange={handleVideoUpload} />
            {videoUrl && (
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-64 max-w-lg border rounded-md shadow"
                    crossOrigin="anonymous"
                    playsInline
                    muted
                    controls
                />
            )}
            <canvas ref={canvasRef} className="hidden" />
            {/* Analog capture control: Capture from the current playing frame */}
            <button
                onClick={handleAnalogCapture}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-max"
            >
                Capture Current Frame
            </button>
            <div className="flex items-center gap-4">
                <label className="flex flex-col text-sm">
                    Capture at (seconds):
                    <input
                        type="number"
                        value={timestamp}
                        onChange={(e) => setTimestamp(Number(e.target.value))}
                        min={0}
                        step={0.1}
                        className="border px-2 py-1 rounded mt-1 w-24"
                    />
                </label>
                <button
                    onClick={handleCustomCapture}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    Capture at Timestamp
                </button>
            </div>

            {thumbnail && (
                <div className="space-y-2 mt-4">
                    <p className="font-medium">
                        Generated Thumbnail (1200×630):
                    </p>
                    <img
                        src={thumbnail}
                        alt="Thumbnail"
                        className="border rounded shadow max-w-full"
                    />
                </div>
            )}
        </div>
    );
}

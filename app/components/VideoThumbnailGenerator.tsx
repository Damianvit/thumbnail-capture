import React, { useRef, useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/app/utils/cropper";
import { Area } from "react-easy-crop";
import Image from "next/image";

export default function VideoThumbnailGenerator({
    videoUrl,
}: {
    videoUrl: string;
}) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
        null
    );

    const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const captureCurrentFrame = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL("image/jpeg");
            setCapturedImage(dataURL);
            setShowCropper(true);
        }
    }, []);

    const captureFrameAtTime = useCallback(
        (time: number = 5) => {
            const video = videoRef.current;
            if (!video) return;

            const handleSeeked = () => {
                captureCurrentFrame();
                video.removeEventListener("seeked", handleSeeked);
            };

            video.addEventListener("seeked", handleSeeked);
            video.currentTime = time;
            video.pause();
        },
        [captureCurrentFrame]
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            captureFrameAtTime(5);
        }, 500);

        return () => clearTimeout(timeout);
    }, [captureFrameAtTime]);

    const generateThumbnail = async () => {
        if (!capturedImage || !croppedAreaPixels) return;

        const croppedImg = await getCroppedImg(
            capturedImage,
            croppedAreaPixels,
            1200,
            630
        );
        setThumbnailSrc(croppedImg);
        setShowCropper(false);
    };

    return (
        <div className="p-4 space-y-4">
            <video
                ref={videoRef}
                controls
                src={videoUrl}
                className="w-full max-w-xl rounded shadow"
            />
            <button
                onClick={captureCurrentFrame}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Capture Current Frame
            </button>

            {capturedImage && showCropper && (
                <div className="relative w-full h-[400px]">
                    <Cropper
                        image={capturedImage}
                        crop={crop}
                        zoom={zoom}
                        aspect={1200 / 630}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>
            )}

            {capturedImage && showCropper && (
                <button
                    onClick={generateThumbnail}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    Generate Thumbnail
                </button>
            )}
            {thumbnailSrc && (
                <div>
                    <h3 className="font-semibold">Generated Thumbnail:</h3>
                    <Image
                        src={thumbnailSrc}
                        alt="Generated Thumbnail"
                        width={300}
                        height={158} // 300 * (630 / 1200)
                        className="border rounded shadow"
                    />
                </div>
            )}

            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    );
}

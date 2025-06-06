"use client";

import { useState } from "react";
import VideoThumbnailGenerator from "@/app/components/VideoThumbnailGenerator";
export default function Home() {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setVideoUrl(url);
    };
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                />
                {videoUrl && <VideoThumbnailGenerator videoUrl={videoUrl} />}
            </main>
        </div>
    );
}

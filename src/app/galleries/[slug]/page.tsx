"use client";
import React, { useEffect, useState } from "react";
import Gallery from "../../components/Gallery";
import { useSearchParams } from "next/navigation";

export default function GalleryPage() {
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSlug(decodeURIComponent(window.location.pathname.split("/").pop() || ""));
    }
  }, []);

  if (!folderId) {
    return <div>No folder selected. Please use a valid gallery link.</div>;
  }

  const isStPatricks = slug === "wearing-of-the-green-2026";

  return (
    <div className={isStPatricks ? "min-h-screen bg-green-100 flex flex-col items-center py-8" : "min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center py-16 font-sans"}>
      <h1 className={isStPatricks ? "text-4xl font-bold text-green-700 mb-8" : "text-3xl font-bold mb-6 text-black dark:text-zinc-50"}>
        {isStPatricks ? "🍀 Wearing of the Green 🍀" : "Gallery"}
      </h1>
      <Gallery folderId={folderId} />
      {isStPatricks && <div className="mt-12 text-green-700 text-lg font-medium">Happy St. Patrick's Day! 🍀</div>}
    </div>
  );
}

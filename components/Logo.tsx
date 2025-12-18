"use client";

import Image from "next/image";
import { useState } from "react";

export default function Logo({ size = 24 }: { size?: number }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return <span className="text-2xl font-bold text-primary">AstraSemi</span>;
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Image
        src="/logo.png"
        alt="Company Logo"
        fill
        className="object-contain"
        unoptimized
        onError={() => setImageError(true)}
      />
    </div>
  );
}


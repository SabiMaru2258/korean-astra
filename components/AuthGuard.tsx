"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type Props = {
  allowedRoles: Array<"admin" | "user">;
  children: React.ReactNode;
};

export default function AuthGuard({ allowedRoles, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "denied" | "allowed">(
    "loading"
  );

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch("/api/session", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setStatus("denied");
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          if (allowedRoles.includes(data.role)) {
            setStatus("allowed");
          } else {
            setStatus("denied");
          }
        }
      } catch {
        if (!cancelled) setStatus("denied");
      }
    };
    check();
    return () => {
      cancelled = true;
    };
  }, [allowedRoles, pathname]);

  useEffect(() => {
    if (status === "denied") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-500 dark:text-gray-300">
        Checking access...
      </div>
    );
  }

  if (status === "denied") {
    return null;
  }

  return <>{children}</>;
}

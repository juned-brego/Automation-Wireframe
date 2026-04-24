"use client";

import Sidebar from "@/components/Sidebar";
import { useRouter, usePathname } from "next/navigation";

export default function DaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine active page from URL
  const getActivePage = () => {
    if (pathname.startsWith("/app/da/dashboard")) return "dashboard";
    if (pathname.startsWith("/app/da/master")) return "master";
    if (pathname.startsWith("/app/da/gst")) return "gst";
    if (pathname.startsWith("/app/da/review")) return "review";
    if (pathname.startsWith("/app/da/tds-filing")) return "tds-filing";
    if (pathname.startsWith("/app/da/mis-report")) return "mis-report";
    if (pathname.startsWith("/app/da/advanced-text")) return "advanced-text";
    if (pathname.startsWith("/app/da/transactions")) return "transactions";
    if (
      pathname.startsWith("/app/da/bulk-upload") ||
      pathname.startsWith("/app/da/sales")
    )
      return "bulk-upload";
    return "bulk-upload";
  };

  const handleNavigate = (page: string) => {
    if (page === "dashboard") {
      router.push("/app/da/dashboard");
    } else if (page === "bulk-upload") {
      router.push("/app/da/bulk-upload/banking");
    } else if (page === "transactions") {
      router.push("/app/da/transactions");
    } else if (page === "master") {
      router.push("/app/da/master");
    } else if (page === "gst") {
      router.push("/app/da/gst");
    } else if (page === "review") {
      router.push("/app/da/review");
    } else if (page === "tds-filing") {
      router.push("/app/da/tds-filing");
    } else if (page === "mis-report") {
      router.push("/app/da/mis-report");
    } else if (page === "advanced-text") {
      router.push("/app/da/advanced-text");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activePage={getActivePage()} onNavigate={handleNavigate} />
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  );
}

import { type ReactNode } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface PageLoaderProps {
  fallback?: ReactNode;
}

export function PageLoader({ fallback = <LoadingSpinner /> }: PageLoaderProps) {
  return fallback;
}

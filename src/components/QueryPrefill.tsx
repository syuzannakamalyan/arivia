"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

// Hands the page's ?query values to a form once, so links from the home page
// (for example /routes?from=Yerevan&to=Tbilisi) arrive filled in.
// Render it inside <Suspense>, as Next.js needs for reading the query.
export default function QueryPrefill({ onParams }: { onParams: (params: URLSearchParams) => void }) {
  const params = useSearchParams();
  const done = useRef(false);

  useEffect(() => {
    if (done.current || params.size === 0) return;
    done.current = true;
    onParams(params);
  }, [params, onParams]);

  return null;
}

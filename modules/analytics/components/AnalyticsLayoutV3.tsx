"use client";

import React from "react";

interface AnalyticsLayoutV3Props {
 children: React.ReactNode;
}

export function AnalyticsLayoutV3({ children }: AnalyticsLayoutV3Props) {
 return (
 <div className="w-full max-w-7xl mx-auto px-10">
 <div className="flex flex-col gap-12">
 {children}
 </div>
 </div>
 );
}

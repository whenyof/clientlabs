"use client";

import React from "react";
import { motion } from "framer-motion";
import { SecondaryInsightCard } from "./SecondaryInsightCard";
import type { InsightV2 } from "../../insights-engine-v2/types/insights-v2.types";

interface SecondaryAlertsCompactProps {
 insights: InsightV2[];
}

export function SecondaryAlertsCompact({ insights }: SecondaryAlertsCompactProps) {
 if (insights.length === 0) return null;

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
 {insights.slice(0, 3).map((insight, idx) => (
 <motion.div
 key={idx}
 initial={{ opacity: 0, y: 6 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3, delay: idx * 0.05 }}
 className="h-full"
 >
 <SecondaryInsightCard insight={insight} />
 </motion.div>
 ))}
 </div>
 );
}

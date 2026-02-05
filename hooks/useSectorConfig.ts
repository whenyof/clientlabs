"use client"

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { getSectorConfigByPath, SectorConfig } from "@/config/sectors";

/**
 * Hook para acceder a la configuración del sector actual en componentes del lado del cliente.
 */
export function useSectorConfig(): SectorConfig {
    const pathname = usePathname();

    const config = useMemo(() => {
        return getSectorConfigByPath(pathname || "");
    }, [pathname]);

    return config;
}

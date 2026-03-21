/* Live camera scanner (minimal diagnostic mode) */
"use client"

import { useEffect } from "react"

export type LiveScannerProps = {
  onCapture: (blob: Blob) => void
  onCancel: () => void
  onFinish: () => void
  pageCount: number
}

export function LiveScanner(_props: LiveScannerProps) {
  console.log("LiveScanner render")

  useEffect(() => {
    console.log("LiveScanner mounted")
  }, [])

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "red",
        zIndex: 9999,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      SCANNER TEST
    </div>
  )
}


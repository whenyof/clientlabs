/* Live camera scanner (minimal diagnostic mode) */
"use client"

import { useEffect, useRef } from "react"

export type LiveScannerProps = {
  onCapture: (blob: Blob) => void
  onCancel: () => void
  onFinish: () => void
  pageCount: number
}

export function LiveScanner(_props: LiveScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })

        const video = videoRef.current

        if (!video) {
          console.error("video ref null")
          return
        }

        video.srcObject = stream
        video.muted = true
        video.playsInline = true

        await video.play()

        console.log("Camera started", video.videoWidth, video.videoHeight)
      } catch (err) {
        console.error("Camera error:", err)
      }
    }

    startCamera()
  }, [])

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        background: "black",
      }}
    />
  )
}


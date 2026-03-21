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
    let stream: MediaStream | null = null

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
          },
        })

        const video = videoRef.current

        if (!video) {
          console.error("Video element not ready")
          return
        }

        video.srcObject = stream
        video.setAttribute("playsinline", "true")
        video.muted = true

        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            resolve(true)
          }
        })
        await video.play()

        console.log("Camera working:", video.videoWidth, video.videoHeight)
      } catch (err) {
        console.error("Camera failed:", err)
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
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
        backgroundColor: "black",
      }}
    />
  )
}


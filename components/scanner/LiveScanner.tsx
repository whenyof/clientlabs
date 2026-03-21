"use client"

import { useEffect, useRef } from "react"

export type LiveScannerProps = {
  onCapture: (blob: Blob) => void
  onCancel: () => void
  onFinish?: () => void
  pageCount?: number
}

export function LiveScanner({ onCapture, onCancel }: LiveScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const handleCapture = async () => {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(video, 0, 0)

    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", 0.95)
    )

    if (blob) onCapture(blob)
  }

  useEffect(() => {
    let stream: MediaStream | null = null

    const start = async () => {
      const video = videoRef.current
      if (!video) return

      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      video.srcObject = stream
      video.muted = true
      video.playsInline = true
      await video.play()
    }

    start()

    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "black",
        zIndex: 999999,
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />
      <button
        type="button"
        onClick={onCancel}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "8px 16px",
          background: "rgba(255,255,255,0.9)",
          border: "none",
          borderRadius: "8px",
          zIndex: 1000000,
          pointerEvents: "auto",
          cursor: "pointer",
        }}
      >
        Cerrar
      </button>
      <button
        type="button"
        onClick={handleCapture}
        style={{
          position: "absolute",
          bottom: "30px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "white",
          zIndex: 1000000,
          pointerEvents: "auto",
        }}
      />
    </div>
  )
}

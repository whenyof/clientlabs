/* Live camera scanner (minimal diagnostic mode) */
"use client"

import { useEffect, useRef } from "react"

export type LiveScannerProps = {
  onCapture: (blob: Blob) => void
  onCancel: () => void
  onFinish: () => void
  pageCount: number
}

export function LiveScanner({ onCapture }: LiveScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const handleCapture = () => {
    const video = videoRef.current
    if (!video) return
    if (!video.videoWidth || !video.videoHeight) return

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0)

    canvas.toBlob(
      (blob) => {
        if (blob) {
          console.log("CAPTURE OK", blob)
          onCapture(blob)
        }
      },
      "image/jpeg",
      0.95,
    )
  }

  function waitForVideo() {
    return new Promise<HTMLVideoElement>((resolve) => {
      const check = () => {
        if (videoRef.current) {
          resolve(videoRef.current)
        } else {
          requestAnimationFrame(check)
        }
      }
      check()
    })
  }

  useEffect(() => {
    let stream: MediaStream | null = null

    async function startCamera() {
      try {
        const video = await waitForVideo()

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
          },
        })

        video.srcObject = stream
        video.muted = true
        video.playsInline = true

        await new Promise((resolve) => {
          video.onloadedmetadata = () => resolve(true)
        })

        await video.play()

        console.log("Camera OK", video.videoWidth, video.videoHeight)
      } catch (err) {
        console.error("Camera error:", err)
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
    <div
      style={{
        background: "black",
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          onClick={handleCapture}
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "white",
            border: "4px solid rgba(0,0,0,0.3)",
          }}
        />
      </div>
    </div>
  )
}


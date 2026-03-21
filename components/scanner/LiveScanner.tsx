/* Live camera scanner (minimal diagnostic mode) */
"use client"

import { useEffect, useRef, useCallback } from "react"

export type LiveScannerProps = {
  onCapture: (blob: Blob) => void
  onCancel: () => void
  onFinish: () => void
  pageCount: number
}

function waitForVideoReady(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve, reject) => {
    if (video.videoWidth > 0) {
      resolve()
      return
    }
    const timeout = setTimeout(() => {
      clearInterval(interval)
      reject(new Error("Video never became ready"))
    }, 15000)
    const interval = setInterval(() => {
      if (video.videoWidth > 0) {
        clearInterval(interval)
        clearTimeout(timeout)
        resolve()
      }
    }, 100)
  })
}

export function LiveScanner({ onCapture }: LiveScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const handleCapture = useCallback(async () => {
    console.log("CAPTURE START")

    const video = videoRef.current
    if (!video) {
      console.log("NO VIDEO")
      return
    }

    try {
      await waitForVideoReady(video)
    } catch (err) {
      console.error("Video not ready:", err)
      return
    }

    console.log("VIDEO READY:", video.videoWidth, video.videoHeight)

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.log("NO CONTEXT")
      return
    }

    ctx.drawImage(video, 0, 0)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.95)
    )

    if (!blob) {
      console.log("BLOB FAILED")
      return
    }

    console.log("CAPTURE SUCCESS")
    onCapture(blob)
  }, [onCapture])

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
          pointerEvents: "none",
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
          zIndex: 10000,
          pointerEvents: "auto",
        }}
      >
        <button
          type="button"
          onClick={() => {
            console.log("CLICK DETECTED")
            handleCapture()
          }}
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "white",
            border: "4px solid rgba(0,0,0,0.3)",
            pointerEvents: "auto",
          }}
        />
      </div>
    </div>
  )
}


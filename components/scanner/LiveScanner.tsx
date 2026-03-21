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
    </div>
  )
}


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
    let timeout1: number | undefined
    let timeout2: number | undefined
    let timeout3: number | undefined

    async function startCamera() {
      console.log("STEP 1: requesting camera")
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
          },
        })
        console.log("STEP 2: stream obtained", stream)
        console.log("Tracks:", stream.getTracks())
        console.log("Video tracks:", stream.getVideoTracks())
        console.log("Track state:", stream.getVideoTracks()[0]?.readyState)
        console.log("Track enabled:", stream.getVideoTracks()[0]?.enabled)

        const video = videoRef.current
        console.log("STEP 3: video ref", video)

        if (!video) {
          console.error("VIDEO REF IS NULL")
          return
        }

        video.srcObject = stream
        console.log("STEP 4: stream assigned to video")
        video.setAttribute("playsinline", "true")
        video.muted = true

        video.oncanplay = () => {
          console.log("STEP 6: can play", video.readyState)
        }

        video.onplaying = () => {
          console.log("STEP 7: playing", {
            width: video.videoWidth,
            height: video.videoHeight,
          })
        }

        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            console.log("STEP 5: metadata loaded", {
              readyState: video.readyState,
              width: video.videoWidth,
              height: video.videoHeight,
            })
            resolve(true)
          }
        })

        try {
          await video.play()
          console.log("STEP 8: play success")
        } catch (err) {
          console.error("STEP 8 ERROR: play failed", err)
        }

        timeout1 = window.setTimeout(() => {
          const rect = video.getBoundingClientRect()
          console.log("STEP 9: video size", rect)

          const styles = window.getComputedStyle(video)
          console.log("STEP 10: video styles", {
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            zIndex: styles.zIndex,
          })
        }, 1000)

        timeout2 = window.setTimeout(() => {
          const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)
          console.log("STEP 11: top element at center", el)
        }, 1500)

        timeout3 = window.setTimeout(() => {
          const track = stream?.getVideoTracks()[0]
          console.log("STEP 12: track status after 2s", {
            readyState: track?.readyState,
            muted: track?.muted,
            enabled: track?.enabled,
          })
        }, 2000)
      } catch (err) {
        const error = err as any
        console.error("STEP 1 ERROR:", error?.name, error?.message)
      }
    }

    startCamera()

    return () => {
      if (timeout1) window.clearTimeout(timeout1)
      if (timeout2) window.clearTimeout(timeout2)
      if (timeout3) window.clearTimeout(timeout3)
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


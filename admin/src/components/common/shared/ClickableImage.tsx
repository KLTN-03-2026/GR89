"use client"
import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ClickableImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallbackSrc?: string
}

export function ClickableImage({
  src,
  alt,
  width = 50,
  height = 50,
  className = "w-[50px] h-[50px] aspect-square object-cover border-gray-200",
  fallbackSrc = "/images/logo.png"
}: ClickableImageProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="group relative overflow-hidden hover:scale-105 transition-transform cursor-pointer"
        onClick={() => setOpen(true)}
        aria-label="Open image"
      >
        <Image
          src={src || fallbackSrc}
          alt={alt}
          width={width}
          height={height}
          className={className}
          priority
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
          <div className="w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[600px] w-[90vw] p-0">
          <div className="w-full h-auto max-h-[80vh] flex items-center justify-center">
            <Image
              src={src || fallbackSrc}
              alt={alt}
              width={600}
              height={600}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

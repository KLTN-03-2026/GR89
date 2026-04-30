'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Keyboard } from 'lucide-react'
import { useState } from 'react'

export default function DictationShortcut() {
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)

  return (
    <Dialog open={isShortcutsOpen} onOpenChange={setIsShortcutsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={() => setIsShortcutsOpen(true)}>
          <Keyboard className="w-4 h-4 mr-2" />
          Phím tắt
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Phím tắt</DialogTitle>
          <DialogDescription>Ctrl: Phát/tạm dừng. Ctrl/Alt + ← / →: Tua 5 giây.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setIsShortcutsOpen(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

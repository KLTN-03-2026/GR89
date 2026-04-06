'use client'
import { useState } from "react";
import ReadingContent from "./ReadingContent";
import ReadingHeader from "./ReadingHeader";

export function ReadingMain() {
  const [refresh, setRefresh] = useState(false)

  return (
    <div>
      <ReadingHeader callback={() => setRefresh(!refresh)} />
      <ReadingContent refresh={refresh} callback={() => setRefresh(!refresh)} />
    </div>
  )
}
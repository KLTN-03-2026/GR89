'use client'
import { useState } from "react";
import SpeakingContent from "./SpeakingContent";
import SpeakingHeader from "./SpeakingHeader";

export function SpeakingMain() {
  const [refresh, setRefresh] = useState(false)

  return (
    <div>
      <SpeakingHeader callback={() => setRefresh(!refresh)} />
      <SpeakingContent refresh={refresh} callback={() => setRefresh(!refresh)} />
    </div>
  )
}

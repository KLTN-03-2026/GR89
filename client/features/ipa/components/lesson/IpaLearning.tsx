'use client'

import LessonIpa from "./LessonIpa";
import { IIpa } from "@/types";

interface IpaLearningProps {
  ipaData: IIpa
}

export function IpaLearning({ ipaData }: IpaLearningProps) {
  return (
    <LessonIpa
      video={ipaData.video}
      image={ipaData.image}
      description={ipaData.description}
      sound={ipaData.sound}
    />
  )
}

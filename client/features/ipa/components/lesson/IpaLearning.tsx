'use client'

import { IIpa } from "../../types";
import LessonIpa from "./LessonIpa";

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

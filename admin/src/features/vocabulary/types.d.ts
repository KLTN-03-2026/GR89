import { User } from "../user/types";

export interface VocabularyTopic {
  _id: string;
  orderIndex: number;
  name: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  image: {
    _id: string;
    url: string;
  }
  vocabularies: Vocabulary[]
  isActive: boolean;
  isVipRequired: boolean;
  createdBy: User
  updatedBy?: User
  createdAt: string;
  updatedAt: string;
}

export interface Vocabulary {
  _id: string;
  word: string;
  transcription: string;
  partOfSpeech: string;
  definition: string;
  vietnameseMeaning: string;
  example: string;
  image: {
    _id: string;
    url: string;
  };
  isVipRequired: boolean;
  vocabularyTopicId: string;
  createdBy: User;
  updatedBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyResult {
  vocabulary: Vocabulary[],
  vocabularyTopic: VocabularyTopic
}
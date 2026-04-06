'use client'
import { IIpa } from "@/types";
import CardIpa from "./CardIpa";
import { Card, CardContent } from "@/components/ui/card";
import { Waves } from "lucide-react";
import { useMemo } from "react";

interface ListCardIpaProps {
  ipaList: IIpa[]
}

export function ListCardIpa({ ipaList }: ListCardIpaProps) {
  const { ipaVowel, ipaDiphthong, ipaConsonant } = useMemo(() => {
    return {
      ipaVowel: ipaList.filter(ipa => ipa.soundType === 'vowel'),
      ipaDiphthong: ipaList.filter(ipa => ipa.soundType === 'diphthong'),
      ipaConsonant: ipaList.filter(ipa => ipa.soundType === 'consonant')
    }
  }, [ipaList])

  if (ipaConsonant.length === 0 && ipaVowel.length === 0 && ipaDiphthong.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 px-4">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-purple-100 rounded-full blur-xl opacity-40" />
            <div className="relative bg-gradient-to-br from-violet-500 to-purple-500 p-6 rounded-full text-white">
              <Waves className="w-12 h-12" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có âm IPA</h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Bộ âm IPA đang được cập nhật. Bạn hãy quay lại sau để tiếp tục luyện phát âm nhé!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div>
        <h2 className="my-4 text-xl font-bold">Phụ âm</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-5">
          {ipaConsonant && ipaConsonant.length > 0 ? (
            ipaConsonant.map(ipa => (
              ipa.examples && ipa.examples.length > 0 && (
                <CardIpa
                  key={ipa._id}
                  _id={ipa._id}
                  sound={ipa.sound}
                  soundType="consonant"
                  examples={ipa.examples}
                  progress={ipa.progress}
                  isVipRequired={ipa.isVipRequired}
                />
              )
            ))
          ) : (
            <div className="col-span-full text-sm text-gray-500 italic">Không có phụ âm nào khả dụng</div>
          )}
        </div>
      </div>

      <div>
        <h2 className="my-4 text-xl font-bold">Nguyên âm</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-5">
          {ipaVowel && ipaVowel.length > 0 ? (
            ipaVowel.map(ipa => (
              ipa.examples && ipa.examples.length > 0 && (
                <CardIpa
                  key={ipa._id}
                  _id={ipa._id}
                  sound={ipa.sound}
                  soundType="vowel"
                  examples={ipa.examples}
                  progress={ipa.progress}
                  isVipRequired={ipa.isVipRequired}
                />
              )
            ))
          ) : (
            <div className="col-span-full text-sm text-gray-500 italic">Không có nguyên âm nào khả dụng</div>
          )}
        </div>
      </div>

      <div>
        <h2 className="my-4 text-xl font-bold">Nguyên âm đôi</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-5">
          {ipaDiphthong && ipaDiphthong.length > 0 ? (
            ipaDiphthong.map(ipa => (
              ipa.examples && ipa.examples.length > 0 && (
                <CardIpa
                  key={ipa._id}
                  _id={ipa._id}
                  sound={ipa.sound}
                  soundType="diphthong"
                  examples={ipa.examples}
                  progress={ipa.progress}
                  isVipRequired={ipa.isVipRequired}
                />
              )
            ))
          ) : (
            <div className="col-span-full text-sm text-gray-500 italic">Không có nguyên âm đôi nào khả dụng</div>
          )}
        </div>
      </div>
    </>
  )
}


'use client'
import { IIpa } from "@/features/ipa/types";
import { Card, CardContent } from "@/components/ui/card";
import { Waves } from "lucide-react";
import { useMemo } from "react";
import CardIpa from "./CardIpa";

interface ListCardIpaProps {
  ipaList: IIpa[]
}

const MONOPHTHONG_ROWS = [
  ['iː', 'ɪ', 'ʊ', 'uː'],
  ['e', 'ə', 'ɜː', 'ɔː'],
  ['æ', 'ʌ', 'ɑː', 'ɒ'],
];

const DIPHTHONG_ROWS = [
  ['ɪə', 'eɪ'],
  ['ʊə', 'ɔɪ', 'əʊ'],
  ['eə', 'aɪ', 'aʊ'],
];

const CONSONANT_ROWS = [
  ['p', 'b', 't', 'd', 'tʃ', 'dʒ', 'k', 'g'],
  ['f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ'],
  ['m', 'n', 'ŋ', 'h', 'l', 'r', 'w', 'j'],
];

function normalizeIpaSymbol(value: string) {
  return value
    .toLowerCase()
    .replaceAll('/', '')
    .replaceAll('ː', ':')
    .replace(/\s+/g, '');
}

export function ListCardIpa({ ipaList }: ListCardIpaProps) {
  const { ipaByKey, ipaVowel, ipaDiphthong, ipaConsonant } = useMemo(() => {
    const validIpaList = ipaList.filter(ipa => ipa.examples?.length > 0);
    const map = new Map<string, IIpa>();

    validIpaList.forEach((ipa) => {
      map.set(normalizeIpaSymbol(ipa.sound), ipa);
    });

    return {
      ipaByKey: map,
      ipaVowel: validIpaList.filter(ipa => ipa.soundType === 'vowel'),
      ipaDiphthong: validIpaList.filter(ipa => ipa.soundType === 'diphthong'),
      ipaConsonant: validIpaList.filter(ipa => ipa.soundType === 'consonant'),
    };
  }, [ipaList])

  const getIpaBySymbol = (symbol: string) => ipaByKey.get(normalizeIpaSymbol(symbol));
  const renderIpaCell = (symbol: string) => {
    const ipa = getIpaBySymbol(symbol);

    if (!ipa) {
      return;
    }

    return (<CardIpa _id={ipa._id} sound={ipa.sound} soundType={ipa.soundType} examples={ipa.examples} progress={ipa.progress} />);
  };

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
    <div className="overflow-x-auto rounded-xl bg-white xl:px-10">
      <table className="min-w-[980px] w-full border-collapse text-center">
        <thead>
          <tr className="bg-gray-100 text-sm font-semibold text-gray-800">
            <th className="w-14" />
            <th colSpan={4} className="py-5 mx-1 text-md md:text-xl uppercase">Nguyên âm đơn</th>
            <th colSpan={3} className="py-5 mx-1 text-md md:text-xl uppercase">Nguyên âm đôi</th>
          </tr>
        </thead>

        <tbody>
          {MONOPHTHONG_ROWS.map((monoRow, rowIndex) => (
            <tr key={`vowels-${rowIndex}`}>
              {rowIndex === 0 && (
                <td
                  rowSpan={3}
                  className="bg-[#ececec] align-middle"
                >
                  <span className="[writing-mode:vertical-rl] uppercase rotate-180 text-md md:text-xl font-semibold tracking-wide">
                    NGUYÊN ÂM
                  </span>
                </td>
              )}
              {monoRow.map(symbol => (
                <td key={`mono-${rowIndex}-${symbol}`} className="p-1">
                  {renderIpaCell(symbol)}
                </td>
              ))}
              {DIPHTHONG_ROWS[rowIndex].map(symbol => (
                <td key={`diph-${rowIndex}-${symbol}`} className="p-1">
                  {renderIpaCell(symbol)}
                </td>
              ))}
            </tr>
          ))}

          {CONSONANT_ROWS.map((row, rowIndex) => (
            <tr key={`consonants-${rowIndex}`} >
              {rowIndex === 0 && (
                <td
                  rowSpan={3}
                  className="bg-[#f5f5aa] align-middle"
                >
                  <span className="[writing-mode:vertical-rl] uppercase rotate-180 text-md md:text-xl font-semibold tracking-wide">
                    PHỤ ÂM
                  </span>
                </td>
              )}
              {row.map(symbol => (
                <td key={`cons-${rowIndex}-${symbol}`} className="p-1">
                  {renderIpaCell(symbol)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


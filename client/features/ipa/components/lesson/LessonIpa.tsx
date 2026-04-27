import { VideoSection } from "@/components/common/medias";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface props {
  video: string
  image: string
  description: string
  sound: string
}

export default function LessonIpa({ video, image, description, sound }: props) {
  return (
    <div className="mt-5 grid grid-cols-1 xl:grid-cols-12 gap-5">
      <Card className="xl:col-span-8 border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg md:text-xl font-semibold text-slate-800">
            Video hướng dẫn phát âm
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <VideoSection src={video} />
        </CardContent>
      </Card>

      <Card className="xl:col-span-4 border-0 shadow-none rounded-2xl overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg md:text-xl font-semibold text-slate-800">
            Mô tả cách phát âm
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          <VideoSection src={image} />

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
            <h3 className="text-base md:text-lg font-bold text-slate-900">
              Kỹ thuật phát âm âm /{sound}/
            </h3>

            <p className="text-sm md:text-[15px] leading-7 text-slate-700">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


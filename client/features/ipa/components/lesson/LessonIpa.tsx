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
    <div className="flex flex-col xl:flex-row gap-4 mt-5">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">Video hướng dẫn phát âm</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoSection src={video} />
        </CardContent>
      </Card>

      <Card className="w-full xl:w-[400px]">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">
            Mô tả cách phát âm
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col md:flex-row xl:flex-col gap-4 items-center">
          <VideoSection src={image} />

          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-3">
              Kỹ thuật phát âm âm /{sound}/
            </h3>

            <p>{description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


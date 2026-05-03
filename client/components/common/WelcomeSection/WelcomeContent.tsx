import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { IWelcomeContentProps } from '@/types'

export default function WelcomeContent({ hightlightColor, Icon, title, titleHighlight, badge, badge2, descriptions, background }: IWelcomeContentProps) {
  return (
    <div className=" space-y-8">
      <div className="flex items-center gap-4 ">
        <div className="flex items-center p-2 rounded-xl bg-white/80 border border-gray-400">
          {
            typeof Icon === 'string' ? (
              <Image src={Icon} alt="logo" width={50} height={50} />
            ) : (
              <Icon className="w-10 h-10" />
            )
          }
        </div>

        <div className="flex flex-wrap gap-3 ">
          <Badge className="bg-white/15 text-white text-md border-white/25 backdrop-blur-sm font-medium px-4 py-2 shadow-md">
            {badge}
          </Badge>
          <Badge className={`block xl:hidden bg-gradient-to-r text-md ${background} text-white border-0 backdrop-blur-sm font-medium px-4 py-2 shadow-md`}>
            {badge2}
          </Badge>
        </div>
      </div>

      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
          <span>{title}</span><br />
          <span className="text-yellow-300">{titleHighlight}</span>
        </h1>
        <p className="text-white/90 text-lg font-semibold">
          {descriptions.map((description, index) => (
            <span key={index}>
              {description.text}
              {
                description.textHighlight &&
                <span className={`mx-1 p-1 px-2 font-bold ${hightlightColor} bg-gray-100/20 rounded-md`}>
                  {description.textHighlight}
                </span>
              }
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}

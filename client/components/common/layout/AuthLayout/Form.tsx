import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tabs } from '@/components/ui/tabs'
import Image from 'next/image'

export function Form({ children }: { children: React.ReactNode }) {
  return (
    <Card className='max-w-[420px] w-full'>
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center lg:hidden">
          <Image src="/images/logo.png" alt="logo" width={100} height={100} />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Chào mừng trở lại!</CardTitle>
        <CardDescription className="text-gray-600">
          Đăng nhập để tiếp tục hành trình học tiếng Anh
        </CardDescription>
      </CardHeader>

      <CardContent className='w-full'>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-[#3B82F6] p-2 data-[state=active]:text-white transition-all duration-300"
            >
              Đăng nhập
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="data-[state=active]:bg-[#3B82F6] p-2 data-[state=active]:text-white transition-all duration-300"
            >
              Đăng ký
            </TabsTrigger>
          </TabsList>

          {children}
        </Tabs>
      </CardContent>
    </Card>
  )
}

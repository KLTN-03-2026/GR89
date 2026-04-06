export default function ConnectionLine({ height = 'h-12' }: { height?: string }) {
  return (
    <div className="flex justify-center">
      <div className={`w-1 ${height} bg-gray-300 rounded-full`}></div>
    </div>
  )
}

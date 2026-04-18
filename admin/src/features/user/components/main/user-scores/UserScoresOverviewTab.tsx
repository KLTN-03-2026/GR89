import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/common"
import { columnsUserScores } from "../../table/user-scores/UserScoresColumn"
import { UserScore } from "@/features/user/types"

interface UserScoresOverviewTabProps {
  userScores: UserScore[]
  isLoading: boolean
  page: number
  limit: number
  total: number
  pages: number
  handlePageChange: (newPage: number) => void
  setSearchTerm: (value: string) => void
}

export function UserScoresOverviewTab({
  userScores,
  isLoading,
  page,
  limit,
  total,
  pages,
  handlePageChange,
  setSearchTerm,
}: UserScoresOverviewTabProps) {
  return (
    <Card>
      <CardContent>
        <DataTable
          columns={columnsUserScores()}
          data={userScores}
          isLoading={isLoading}
          serverSidePagination={true}
          pagination={{
            page: page || 1,
            limit: limit || 10,
            total: total || 0,
            pages: pages || 0,
          }}
          onPageChange={handlePageChange}
          onSearch={(search) => setSearchTerm(search)}
          columnNameSearch="searchable"
          initialColumnVisibility={{ searchable: false }}
        />
      </CardContent>
    </Card>
  )
}


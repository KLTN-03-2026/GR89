import authorizedAxios from '@/libs/apis/authorizedAxios'

// (USER) Kiểm tra password lớp
export const checkClassPassword = async (classId: string, password: string) => {
  const response = await authorizedAxios.post('/center-classes/user/check-password', {
    classId,
    password,
  })
  return response.data
}

// (USER) Kiểm tra người dùng đã tham gia lớp học chưa
export const isUserEnrolledInClass = async (classId: string) => {
  const response = await authorizedAxios.post('/center-classes/user/is-enrolled', {
    classId,
  })
  return response.data
}

// (USER) Lấy bài nộp theo học sinh và bài tập
export const getHomeworkSubmissions = async (homeworkId: string) => {
  const response = await authorizedAxios.get(`/center-classes/homework/${homeworkId}/submissions`)
  return response.data
}

// (USER) Nộp bài tập
export const submitHomework = async (homeworkId: string, content: string) => {
  const response = await authorizedAxios.post(`/center-classes/homework/${homeworkId}/submit`, {
    content,
  })
  return response.data
}

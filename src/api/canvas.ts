import { request } from "./util";

export const getCourses = async () => {
    return await request('GET', '/api/v1/courses', { enrollment_state: "active" })
}

export const getQuizzes = async (course_id: string) => {
    return await request('GET', `/api/v1/courses/${course_id}/quizzes`)
}
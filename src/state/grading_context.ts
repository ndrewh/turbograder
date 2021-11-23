export type GradingContext = {
    course_id: string,
    quiz_id: string
}

export type Response = {
    submission_id: String
    question_id: String
    content: string
    old_points: number
    cur_points: number
    old_comment: string
    cur_comment: string
}

export type Submission = {
    submission_id: string,
    student_id: string,
    questions: { [key: string]: Response },
    attempt: number
}

export type QuizData = {
    submissions: Submission[],
    questions: { [key: string]: any }
}
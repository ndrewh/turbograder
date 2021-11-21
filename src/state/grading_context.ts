export type GradingContext = {
    course_id: string,
    quiz_id: string
}

export type Response = {
    question_id: String
    content: string
}

export type Submission = {
    submission_id: string,
    student_id: string,
    questions: { [key: string]: Response }
}
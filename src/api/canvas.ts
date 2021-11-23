import { GradingContext, Response, Submission, QuizData } from "../state/grading_context";
import { request } from "./util";

export const getCourses = async () => {
    return await request('GET', '/api/v1/courses', { enrollment_state: "active" })
}

export const getQuizzes = async (course_id: string) => {
    return await request('GET', `/api/v1/courses/${course_id}/quizzes`)
}

export const getSubmissions = async (grading_context: GradingContext, progress: (percent: Number) => void): Promise<QuizData> => {
    const submissions = await request('GET', `/api/v1/courses/${grading_context.course_id}/quizzes/${grading_context.quiz_id}/submissions`, 'include[]=submission&include[]=user&include[]=submission_history&per_page=1000')
    if (!('quiz_submissions' in submissions)) return;
    var submissions_data: any = {}
    submissions.submissions.forEach((x: any) => { submissions_data[x.id] = x })

    var all_questions: { [key: string]: any } = {};

    let all_submissions: Submission[] = await Promise.all(submissions.quiz_submissions.map(async (quiz_submission_data: any): Promise<Submission> => {
        const submission_data = submissions_data[quiz_submission_data.submission_id]
        console.log(submission_data)
        if (!('submission_history' in submission_data) || submission_data.submission_history.length == 0) return null;

        // TODO: For now, we will only grade the latest submission
        var latest_submission_data = submission_data.submission_history[0];
        submission_data.submission_history.forEach((x: any) => { if (x.attempt > latest_submission_data.attempt) latest_submission_data = x; })

        if (!('submission_data' in latest_submission_data)) return null;

        const questions_data = await request('GET', `/api/v1/quiz_submissions/${quiz_submission_data.id}/questions`)
        const questions_map = questions_data.quiz_submission_questions.reduce((prev: any, x: any) => { return { [x.id]: x, ...prev } }, {})
        all_questions = Object.assign(questions_map, all_questions)

        console.log(questions_map)
        console.log(latest_submission_data.submission_data)

        const questions = latest_submission_data.submission_data.reduce((prev: { [key: string]: Response }, x: any): { [key: string]: Response } => {
            if (!['essay_question', 'short_answer_question'].includes(questions_map[x.question_id].question_type)) return prev;
            const points = x.correct === "undefined" ? null : x.points
            const comment = x.more_comments ?? ""
            return {
                [x.question_id]: { question_id: x.question_id, content: x.text, old_points: points, cur_points: points, old_comment: comment, cur_comment: comment, submission_id: latest_submission_data.id },
                ...prev
            }
        }, {})

        console.log(questions)

        const submission: Submission = {
            submission_id: latest_submission_data.id,
            student_id: latest_submission_data.user_id,
            questions: questions,
            attempt: latest_submission_data.attempt
        }
        return submission
    })
    )

    return { submissions: all_submissions.filter((x: any) => x != null), questions: all_questions };
}

export const putSubmissions = async (quiz_data: QuizData, grading_context: GradingContext) => {
    await Promise.all(quiz_data.submissions.map(async (submission) => {
        const questions = Object.entries(submission.questions).filter(([q_id, response]) => {
            return response.old_points != response.cur_points || response.old_comment != response.cur_comment
        }).map(([q_id, response]) => [q_id, { "score": response.cur_points, "comment": response.cur_comment }])

        if (questions.length == 0) return null
        const data = {
            "quiz_submissions": [{
                "attempt": submission.attempt,
                "questions": Object.fromEntries(questions)
            }]
        }
        const resp = await request('PUT', `/api/v1/courses/${grading_context.course_id}/quizzes/${grading_context.quiz_id}/submissions/${submission.submission_id}`, data)
        /* Update the old_comment and old_points fields to reflect the new server state */
        if (!('errors' in resp)) {
            Object.values(submission.questions).forEach((x) => { x.old_comment = x.cur_comment; x.old_points = x.cur_points; })
        }
        return resp
    }))
}
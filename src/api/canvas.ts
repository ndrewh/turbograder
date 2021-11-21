import { GradingContext, Response, Submission } from "../state/grading_context";
import { request } from "./util";

export const getCourses = async () => {
    return await request('GET', '/api/v1/courses', { enrollment_state: "active" })
}

export const getQuizzes = async (course_id: string) => {
    return await request('GET', `/api/v1/courses/${course_id}/quizzes`)
}

export const getSubmissions = async (grading_context: GradingContext, progress: (percent: Number) => void) => {
    const submissions = await request('GET', `/api/v1/courses/${grading_context.course_id}/quizzes/${grading_context.quiz_id}/submissions`, 'include[]=submission&include[]=user&include[]=submission_history&per_page=1000')
    if (!('quiz_submissions' in submissions)) return;
    var submissions_data: any = {}
    submissions.submissions.forEach((x: any) => { submissions_data[x.id] = x })

    let all_submissions = await Promise.all(submissions.quiz_submissions.map(async (quiz_submission_data: any) => {
        const submission_data = submissions_data[quiz_submission_data.submission_id]
        console.log(submission_data)
        if (!('submission_history' in submission_data) || submission_data.submission_history.length == 0) return null;

        // TODO: For now, we will only grade the latest submission
        var latest_submission_data = submission_data.submission_history[0];
        submission_data.submission_history.forEach((x: any) => { if (latest_submission_data.attempt > x.attempt) latest_submission_data = x; })

        if (!('submission_data' in latest_submission_data)) return null;

        const questions_data = await request('GET', `/api/v1/quiz_submissions/${quiz_submission_data.id}/questions`)
        const questions_map = questions_data.quiz_submission_questions.reduce((prev: any, x: any) => { return { [x.id]: x, ...prev } }, {})
        console.log(questions_map)
        console.log(latest_submission_data.submission_data)

        const questions = latest_submission_data.submission_data.reduce((prev: any, x: any) => {
            if (!['essay_question', 'short_answer_question'].includes(questions_map[x.question_id].question_type)) return prev;
            return {
                [x.question_id]: { question_id: x.question_id, content: x.text },
                ...prev
            }
        }, {})

        console.log(questions)

        const submission: Submission = {
            submission_id: submission_data.id,
            student_id: submission_data.user.id,
            questions: questions
        }
        return submission
    })
    )

    return all_submissions.filter((x: any) => x != null);



}
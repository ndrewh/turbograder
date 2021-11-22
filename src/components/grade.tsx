import { Component } from 'preact'
import { useEffect, useState, useCallback } from 'preact/hooks'
import { GradingContext, Submission, QuizData } from '../state/grading_context'
import GradePane from './grade/grade_pane'

type GradeProps = {
    name: string,
    gradingContext: GradingContext,
    quizData: QuizData
}

type GradeState = {

}

const renderGrade = ({ gradingContext, quizData }: GradeProps) => {
    const [selectedQuestion, setSelectedQuestion] = useState("")

    // const loggedOut = !localStorage.token


    useEffect(() => {
        console.log("Fetching Quiz Responses")

    }, [gradingContext])

    const selectQuestion = useCallback((e: any) => {
        setSelectedQuestion(e.currentTarget.dataset.questionId)
    }, [])

    return (
        <div>
            <div class="pane-group">
                <div class="pane-sm sidebar">
                    <ul class="list-group">
                        {
                            Object.keys(quizData.questions).map((q_id) => {
                                const q = quizData.questions[q_id]
                                return (
                                    <li class={"list-group-item" + (selectedQuestion == q_id ? " active" : "")} data-question-id={q_id} onClick={selectQuestion}>
                                        <div class="media-body">
                                            <strong>{q.question_name} ({q.id})</strong>
                                            <p>{q.question_text}</p>
                                        </div>
                                    </li>
                                )
                            })

                        }
                    </ul>
                </div>
                <div class="pane">
                    <GradePane question={quizData.questions[selectedQuestion]} submissions={quizData.submissions} />
                </div>
            </div>
        </div>
    )
}

export default class Grade extends Component<GradeProps, GradeState> {
    render() {
        return renderGrade(this.props);
    }
}
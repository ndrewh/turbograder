import { Component } from 'preact'
import { useEffect, useState, useMemo, useCallback } from 'preact/hooks'
import { GradingContext, Submission, QuizData } from '../..//state/grading_context'
import Markup from 'preact-markup';


type GradePaneProps = {
    question: any,
    submissions: Submission[]
}

type GradePaneState = {

}

const renderGrade = ({ question, submissions }: GradePaneProps) => {
    if (!question) return (<div />)

    if (question.max_points === undefined) {
        question.max_points = 1
    }
    const [maxPoints, setMaxPoints] = useState(question.max_points)
    const [updateCount, setUpdateCount] = useState(0) // This is a hack so that we get light screen updates when a grade is selected for a response

    const [responses_for_question, ordered_responses] = useMemo((): [{ [key: string]: Submission[] }, string[]] => {
        var answer_to_submission: { [key: string]: Submission[] } = {}
        submissions.forEach((s) => {
            const text = s.questions[question.id].content
            if (text in answer_to_submission) {
                answer_to_submission[text].push(s)
            } else {
                answer_to_submission[text] = [s]
            }
        })

        const ordered_keys = Object.keys(answer_to_submission).sort((a, b) => answer_to_submission[b].length - answer_to_submission[a].length)
        return [answer_to_submission, ordered_keys]
    }, [submissions, question])

    const updateMaxPoints = useCallback((e: any) => {
        setMaxPoints(e.target.value)
        question.max_points = e.target.value;
    }, [])

    const assignGradeToGroup = useCallback((e: any) => {
        let submissions = responses_for_question[ordered_responses[e.currentTarget.dataset.idx]]
        let points = e.currentTarget.dataset.points ?? e.currentTarget.children[0].value
        submissions.forEach((s) => { s.questions[question.id].cur_points = points })
        setUpdateCount((updateCount) => updateCount + 1)
    }, [submissions, question])

    /* Compute discrete point values to show as options */

    const discretePointValues = useMemo(() => {
        var alignment = 1;
        if (question.max_points < 1) {
            alignment = question.max_points / 4.0;
        } else if (question.max_points < 2) {
            alignment = 0.25
        } else if (question.max_points < 4) {
            alignment = 0.5
        }

        var values = []
        for (var i = 0; i < 5; i++) {
            values.push(Math.round((question.max_points / 4.0) * i / alignment) * alignment)
        }
        return values
    }, [maxPoints])

    /* Compute statistics */

    const graded = useMemo(() => {
        return submissions.filter((submission) => ((question.id in submission.questions) && submission.questions[question.id].cur_points !== null)).map((s) => s.questions[question.id])
    }, [submissions, question, updateCount])

    const total = useMemo(() => {
        return submissions.reduce((n, submission) => (question.id in submission.questions) ? n + 1 : n, 0)
    }, [submissions, question])

    const percent_graded = graded.length / total * 100;

    return (
        <div class="pane-group">
            <div class="pane">
                <div class="question_view padded">
                    {
                        <Markup type="html" markup={question.question_text} />
                    }
                </div>
                <div class="columns question-config">
                    <div class="column is-one-third">
                        <form>
                            <div class="form-group">
                                <label>Max Points</label>
                                <input class="form-control" autocorrect='off' name='maxPoints' placeholder='max' type='number' value={question.max_points} onChange={updateMaxPoints} />
                            </div>
                        </form>
                    </div>
                </div>
                <div class="answers_view padded">
                    <ul class="list-group">
                        {
                            ordered_responses.map((text, idx) => {
                                const count = responses_for_question[text].length
                                return (<li class="list-group-item" data-idx={idx}>
                                    <div class="card">
                                        <span class="tag is-info num-answers-tag">{count}</span>
                                        <Markup type="html" markup={text} class="card-content" />
                                        <footer class="card-footer">
                                            {
                                                discretePointValues.map((x) => {
                                                    return (<a class={"card-footer-item" + (x == question.cur_points ? " active" : "")} data-points={x} data-idx={idx} onClick={assignGradeToGroup}>{x}</a>)
                                                })
                                            }
                                            <a class="card-footer-item" data-idx={idx}><input class="form-control" autocorrect='off' name='maxPoints' placeholder='max' type='text' value={question.max_points} /></a>
                                        </footer>
                                    </div>
                                </li>)
                            })
                        }
                    </ul>
                </div>
            </div>
            <div class="pane">
                <div class="padded">
                    <progress class="progress is-primary" value={percent_graded} max="100">{Math.round(percent_graded)}%</progress>
                </div>
                <div class="answers_view padded">
                    <ul class="list-group">
                        {
                            graded.map((response, idx) => {
                                return (<li class="list-group-item" data-idx={idx} key={response.submission_id}>
                                    <div class="card">
                                        <Markup type="html" markup={response.content} class="card-content" />
                                        <div class="form-group">
                                            <input class="form-control" autocorrect='off' name='points' type='text' value={response.cur_points} />
                                        </div>
                                        <div class="form-group">
                                            <textarea class="form-control" autocorrect='off' placeholder="Comment?" name='comment' type='text' value={response.cur_comment} />
                                        </div>
                                    </div>
                                </li>)
                            })
                        }
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default class Grade extends Component<GradePaneProps, GradePaneState> {
    render() {
        return renderGrade(this.props);
    }
}
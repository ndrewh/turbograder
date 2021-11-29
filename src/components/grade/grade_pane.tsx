import { Component } from 'preact'
import { useEffect, useState, useMemo, useCallback } from 'preact/hooks'
import { GradingContext, Submission, QuizData } from '../..//state/grading_context'
import Markup from 'preact-markup';


type GradePaneProps = {
    question: any,
    submissions: Submission[],
    update_num_to_save: (q_id: string, num: number) => void
}

type GradePaneState = {

}

const renderGrade = ({ question, submissions, update_num_to_save }: GradePaneProps) => {
    if (!question) return (<div />)

    if (question.max_points === undefined) {
        question.max_points = 1
    }
    const [maxPoints, setMaxPoints] = useState(question.max_points)
    const [updateCount, setUpdateCount] = useState(0) // This is a hack so that we get light screen updates when a grade is selected for a response

    const [responses_for_question, ordered_responses] = useMemo((): [{ [key: string]: Submission[] }, string[]] => {
        var answer_to_submission: { [key: string]: Submission[] } = {}
        submissions.forEach((s) => {
            if (!(question.id in s.questions)) return;
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
    }, [question])

    const groupInfo = useMemo(() => {
        /* Determine if each group has a coherent score and comment */
        var group_info: { [key: string]: { score?: number, comment?: string } } = {}
        for (const [text, submissions] of Object.entries(responses_for_question)) {
            const comment = submissions[0].questions[question.id].cur_comment
            const score = submissions[0].questions[question.id].cur_points
            const isCoherent = submissions.every((s) => s.questions[question.id].cur_comment == comment && s.questions[question.id].cur_points == score)
            group_info[text] = isCoherent ? { score: score, comment: comment } : {}
        }
        return group_info
    }, [submissions, question, responses_for_question, updateCount])

    useEffect(() => {
        /* Figure out how many responses need to be saved */
        var count = 0;
        for (const s of submissions) {
            if (!(question.id in s.questions)) return;
            const resp = s.questions[question.id]
            if (resp.cur_comment != resp.old_comment || resp.cur_points != resp.old_points) {
                count++;
            }
        }
        /* Update the indicator in the top bar */
        update_num_to_save(question.id, count)
    }, [submissions, question, updateCount])

    const assignGradeToGroup = useCallback((e: any) => {
        const submissions = responses_for_question[ordered_responses[e.currentTarget.dataset.idx]]
        const points = e.currentTarget.dataset.points ?? e.currentTarget.value
        submissions.forEach((s) => { s.questions[question.id].cur_points = points })
        setUpdateCount((updateCount) => updateCount + 1)
    }, [submissions, question, responses_for_question])

    const assignCommentToGroup = useCallback((e: any) => {
        const submissions = responses_for_question[ordered_responses[e.currentTarget.dataset.idx]]
        submissions.forEach((s) => { s.questions[question.id].cur_comment = e.currentTarget.value })
        setUpdateCount((updateCount) => updateCount + 1)
    }, [submissions, question, responses_for_question])

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
    }, [maxPoints, question])

    /* Compute statistics */

    const graded = useMemo(() => {
        return submissions.filter((submission) => ((question.id in submission.questions) && submission.questions[question.id].cur_points !== null)).map((s) => s.questions[question.id])
    }, [submissions, question, updateCount])

    const assignComment = useCallback((e: any) => {
        let response = graded[e.currentTarget.dataset.idx]
        response.cur_comment = e.currentTarget.value
        setUpdateCount((updateCount) => updateCount + 1)
    }, [submissions, question, graded])

    const assignGrade = useCallback((e: any) => {
        let response = graded[e.currentTarget.dataset.idx]
        response.cur_points = e.currentTarget.value
        setUpdateCount((updateCount) => updateCount + 1)
    }, [submissions, question, graded])

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
                <div class="question-config">
                    <div class="column is-one-third">
                        <form>
                            <div class="form-group">
                                <label>Max Points</label>
                                <input class="form-control" autocorrect='off' name='maxPoints' placeholder='max' type='number' value={maxPoints} onChange={updateMaxPoints} />
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
                                    <div class="card student-response">
                                        <span class="tag is-info num-answers-tag">{count}x</span>
                                        <Markup type="html" markup={text} class="card-content" />
                                        <div class="form-group">
                                            <textarea class="form-control" autocorrect='off' placeholder="Comment?" name='comment' type='text' value={groupInfo[text].comment ?? ""} data-idx={idx} onChange={assignCommentToGroup} />
                                        </div>
                                        <footer class="card-footer">
                                            {
                                                discretePointValues.map((x) => {
                                                    return (<a class={"card-footer-item" + (x == groupInfo[text].score ? " active" : "")} data-points={x} data-idx={idx} onClick={assignGradeToGroup}>{x}</a>)
                                                })
                                            }
                                            <a class="card-footer-item" data-idx={idx}><input class="form-control" autocorrect='off' name='maxPoints' placeholder='max' type='text' value={groupInfo[text].score ?? ""} data-idx={idx} onChange={assignGradeToGroup} /></a>
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
                                    <div class="card student-response">
                                        <Markup type="html" markup={response.content} class="card-content" />
                                        <div class="columns padded">
                                            <div class="column is-one-third">
                                                <div class="form-group">
                                                    <input class="form-control" autocorrect='off' name='points' type='text' value={response.cur_points} data-idx={idx} onChange={assignGrade} />
                                                </div>
                                            </div>
                                            <div class="column is-two-thirds">
                                                <div class="form-group">
                                                    <textarea class="form-control" autocorrect='off' placeholder="Comment?" name='comment' type='text' data-idx={idx} value={response.cur_comment} onChange={assignComment} />
                                                </div>
                                            </div>
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
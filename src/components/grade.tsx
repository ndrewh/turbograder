import { Component } from 'preact'
import { useEffect } from 'preact/hooks'
import { GradingContext } from '../state/grading_context'

type GradeProps = {
    name: string,
    gradingContext: GradingContext
}

type GradeState = {

}

const renderGrade = ({ gradingContext }: GradeProps) => {

    // const loggedOut = !localStorage.token


    useEffect(() => {
        console.log("Fetching Quiz Responses")

    }, [gradingContext])

    return (
        <h2>Grade</h2>
    )
}

export default class Grade extends Component<GradeProps, GradeState> {
    render() {
        return renderGrade(this.props);
    }
}
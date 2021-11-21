import { Component } from 'preact'

type GradeProps = {
    name: string
}

type GradeState = {

}

const renderGrade = () => {

    // const loggedOut = !localStorage.token

    return (
        <h2>Grade</h2>
    )
}

export default class Grade extends Component<GradeProps, GradeState> {
    render() {
        return renderGrade();
    }
}
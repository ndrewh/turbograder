import { Component } from 'preact'
import { useEffect, useState, useCallback } from 'preact/hooks'
import { getCourses, getQuizzes } from '../api/canvas'
import { GradingContext } from '../state/grading_context'

type ConfigProps = {
    name: String,
    gradingContext: GradingContext
}

type ConfigState = {
}


const renderConfig = ({ gradingContext }: ConfigProps) => {

    // const loggedOut = !localStorage.token
    const [courses, setCourses] = useState([])
    const [quizzes, setQuizzes] = useState([])
    const [selectedCourse, setSelectedCourse] = useState(gradingContext.course_id)
    const [selectedQuiz, setSelectedQuiz] = useState(gradingContext.quiz_id)
    const [token, setToken] = useState(localStorage.getItem("token"))

    const handleTokenChange = useCallback((e: any) => {
        console.log(e.target.value)
        setToken(e.target.value)
        localStorage.setItem("token", e.target.value)
    }, [])

    const updateConfig = useCallback((e: any) => {
        // Save token, reload courses
        console.log("Config update " + token)
        console.log("Getting courses!")
        getCourses().then(data => setCourses(data))
        // getCourses().then(data => setCourses(data))
    }, [token])

    const handleCourseChange = useCallback((e: any) => {
        setSelectedCourse(e.target.value)
        getQuizzes(e.target.value).then(data => setQuizzes(data))
    }, [])
    const handleQuizChange = useCallback((e: any) => setSelectedQuiz(e.target.value), [])

    const updateContext = useCallback((e: any) => {
        // Save token, reload courses
        gradingContext.course_id = selectedCourse
        gradingContext.quiz_id = selectedQuiz
    }, [selectedCourse, selectedQuiz, gradingContext])



    return (
        <div class='card'>
            <h2>Configure</h2>
            <input autocorrect='off' name='token' placeholder='token' type='text' value={token} onChange={handleTokenChange} />
            <button class="btn-small" onClick={updateConfig}>Save token</button>
            <select value={selectedCourse} onChange={handleCourseChange}>
                {
                    courses.map(course => {
                        return <option value={course.id}>{course.name}</option>
                    })
                }
            </select>
            <select value={selectedQuiz} onChange={handleQuizChange}>
                {
                    quizzes.map(quiz => {
                        return <option value={quiz.id}>{quiz.title}</option>
                    })
                }
            </select>

            <button class="btn-small" onClick={updateContext}>Save</button>
        </div>
    )
}

export default class Configure extends Component<ConfigProps, ConfigState> {
    render() {
        return renderConfig(this.props);
    }
}
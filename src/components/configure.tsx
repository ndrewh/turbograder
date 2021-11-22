import { Component } from 'preact'
import { useEffect, useState, useCallback } from 'preact/hooks'
import { getCourses, getQuizzes } from '../api/canvas'
import { GradingContext } from '../state/grading_context'

type ConfigProps = {
    name: String,
    gradingContext: GradingContext,
    updateGradingContext: (ctx: GradingContext) => void
}

type ConfigState = {
}


const renderConfig = ({ gradingContext, updateGradingContext }: ConfigProps) => {

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
        getQuizzes(e.target.value).then(data => {
            if (!('message' in data)) {
                setQuizzes(data)
            }
        })
    }, [])
    const handleQuizChange = useCallback((e: any) => setSelectedQuiz(e.target.value), [])

    const updateContext = useCallback((e: any) => {
        // Save token, reload courses
        gradingContext.course_id = selectedCourse
        gradingContext.quiz_id = selectedQuiz
        updateGradingContext(gradingContext)
    }, [selectedCourse, selectedQuiz, gradingContext])

    useEffect(() => {
        console.log("effect")
        console.log(selectedCourse)
        if (token.length > 0) {
            getCourses().then(data => setCourses(data)).then(() => {
                if (selectedCourse.length > 0) {
                    getQuizzes(selectedCourse).then(data => {
                        if (!('message' in data)) {
                            setQuizzes(data)
                        }
                    })
                }
            })
        }
    }, [token, selectedCourse, selectedQuiz])



    return (
        <div class='card padded-more'>
            <h2>Configure</h2>
            <form>
                <div class="form-group">
                    <label>Token</label>
                    <input class="form-control" autocorrect='off' name='token' placeholder='token' type='text' value={token} onChange={handleTokenChange} />
                    <a class="btn btn-form btn-default" onClick={updateConfig}>Save token</a>
                </div>
                <div class="form-group">
                    <label>Course</label>
                    <select class="form-control" value={selectedCourse} onChange={handleCourseChange}>
                        {
                            courses.map(course => {
                                return <option value={course.id}>{course.name}</option>
                            })
                        }
                    </select>
                </div>
                <div class="form-group">
                    <label>Quiz</label>
                    <select class="form-control" value={selectedQuiz} onChange={handleQuizChange}>
                        {
                            quizzes.map(quiz => {
                                return <option value={quiz.id}>{quiz.title}</option>
                            })
                        }
                    </select>
                </div>
                <div class="form-group">
                    <a class="btn btn-form btn-default" onClick={updateContext}>Save</a>
                </div>
            </form>
        </div>
    )
}

export default class Configure extends Component<ConfigProps, ConfigState> {
    render() {
        return renderConfig(this.props);
    }
}
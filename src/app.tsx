

import { useState, useCallback, useEffect } from 'preact/hooks'
import Router, { route, CustomHistory } from 'preact-router'
import { Component } from 'preact'
import Configure from './components/configure'
import Home from './components/home'
import Grade from './components/grade'
import Header from './components/header'
import { createHashHistory } from 'history';
import { GradingContext } from './state/grading_context'
import { getSubmissions, putSubmissions } from './api/canvas'



function useTriggerRerender() {
    const setToggle = useState(false)[1]
    return useCallback(() => setToggle(t => !t), [setToggle])
}

function renderApp() {
    const triggerRerender = useTriggerRerender()
    const [gradingContext, setGradingContext] = useState({ course_id: "", quiz_id: "" })
    const [quizData, setQuizData] = useState({ submissions: [], questions: {} })
    const [numChanged, setNumChanged] = useState(0)

    const updateGradingContext = useCallback((context: GradingContext) => {
        console.log("[App] Grading context updated")
        console.log(context)
        setGradingContext(context);

        getSubmissions(context, () => { }).then((quizData) => {
            console.log(quizData)
            setQuizData(quizData)
        })
    }, [])

    const updateNumChanged = useCallback((x: number) => setNumChanged(x), [])

    const uploadGrades = useCallback(async () => {
        const result = await putSubmissions(quizData, gradingContext)
        setQuizData(quizData) // Force re-render
    }, [gradingContext, quizData])

    // const loggedOut = !localStorage.token

    const paths = [
        <Home path="/" key="home" name="Home" />,
        <Grade path="/grade" key="grade" name="Grade" gradingContext={gradingContext} quizData={quizData} update_num_to_save={updateNumChanged} />,
        <Configure path="/configure" key="configure" name="Configure" gradingContext={gradingContext} updateGradingContext={updateGradingContext} />
    ]

    const headerProps = {
        paths: paths,
        icons: { "home": "home", "grade": "pencil", "configure": "tools" },
        num_to_save: numChanged,
        upload_handler: uploadGrades
    }

    return (
        <div class="window">
            <Header {...headerProps} />
            <div class="window-content">
                <Router onChange={triggerRerender} history={createHashHistory() as unknown as CustomHistory}>
                    {paths}
                </Router>
            </div>
        </div>
    )
}

export default class App extends Component {
    render() {
        return renderApp();
    }
}
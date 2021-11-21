

import { useState, useCallback, useEffect } from 'preact/hooks'
import Router, { route, CustomHistory } from 'preact-router'
import { Component } from 'preact'
import Configure from './components/configure'
import Home from './components/home'
import Grade from './components/grade'
import Header from './components/header'
import { createHashHistory } from 'history';
import { GradingContext } from './state/grading_context'
import { getSubmissions } from './api/canvas'



function useTriggerRerender() {
    const setToggle = useState(false)[1]
    return useCallback(() => setToggle(t => !t), [setToggle])
}

function renderApp() {
    const triggerRerender = useTriggerRerender()
    const [gradingContext, setGradingContext] = useState({ course_id: "", quiz_id: "" })

    const updateGradingContext = useCallback((context: GradingContext) => {
        console.log("[App] Grading context updated")
        console.log(context)
        setGradingContext(context);

        getSubmissions(context, () => { }).then((submissions) => {
            console.log(submissions)
        })
    }, [gradingContext])

    // const loggedOut = !localStorage.token

    const paths = [
        <Home path="/" key="home" name="Home" />,
        <Grade path="/grade" key="grade" name="Grade" gradingContext={gradingContext} />,
        <Configure path="/configure" key="configure" name="Configure" gradingContext={gradingContext} updateGradingContext={updateGradingContext} />
    ]

    const headerProps = {
        paths: paths
    }

    return (
        <div>
            <Header {...headerProps} />
            <Router onChange={triggerRerender} history={createHashHistory() as unknown as CustomHistory}>
                {paths}
            </Router>
        </div>
    )
}

export default class App extends Component {
    render() {
        return renderApp();
    }
}
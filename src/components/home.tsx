import { Component } from 'preact'

type HomeProps = {
    name: string
}

type HomeState = {

}

const renderHome = () => {

    // const loggedOut = !localStorage.token

    return (
        <h2>Home</h2>
    )
}

export default class Home extends Component<HomeProps, HomeState> {
    render() {
        return renderHome();
    }
}
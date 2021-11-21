import { Component } from 'preact'
import Match from 'preact-router/match'

type HeaderProps = {
    paths: Array<{ props: { path: string, name: string } }>
}

type HeaderState = {

}
const renderHome = ({ paths }: HeaderProps) => {

    // const loggedOut = !localStorage.token

    return (
        <div class='tab-container tabs-center'>
            <ul>
                {
                    paths.map(({ props: { path, name } }) =>
                        <Match key={name} path={path}>
                            {({ matches }: { matches: boolean }) => (
                                <li class={matches ? 'selected' : ''}>
                                    <a href={path}>{name}</a>
                                </li>
                            )}
                        </Match>
                    )
                }
            </ul>
        </div>
    )
}

export default class Home extends Component<HeaderProps, HeaderState> {
    constructor(props: HeaderProps) {
        super(props)
    }
    render() {
        return renderHome(this.props);
    }
}
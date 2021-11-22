import { Component } from 'preact'
import { route } from 'preact-router'
import Match from 'preact-router/match'
import { useCallback } from 'preact/hooks'

type HeaderProps = {
    paths: Array<{ props: { path: string, name: string } }>
}

type HeaderState = {

}
const renderHome = ({ paths }: HeaderProps) => {

    // const loggedOut = !localStorage.token
    /*
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
                    */
    const paths_info = paths.map(({ props: { path, name } }) => { return { path: path, name: name, route: useCallback(() => route(path), [path]) } })
    return (
        <header class="toolbar toolbar-header">
            <h1 class="title">Turbograder</h1>
            <div class="toolbar-actions">
                <div class="btn-group">
                    {
                        paths_info.map(({ path, name, route }) =>
                            <Match key={name} path={path}>
                                {({ matches }: { matches: boolean }) => (
                                    <button class={"btn btn-default" + (matches ? " active" : "")} onClick={route}>
                                        <span class="icon icon-home icon-text"></span>
                                        {name}
                                    </button>
                                )}
                            </Match>
                        )
                    }
                </div>
            </div>
        </header>
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
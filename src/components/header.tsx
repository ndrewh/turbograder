import { Component } from 'preact'
import { route } from 'preact-router'
import Match from 'preact-router/match'
import { useCallback } from 'preact/hooks'

type HeaderProps = {
    paths: Array<{ key: string, props: { path: string, name: string } }>
    icons: { [key: string]: string }
    num_to_save: number
    upload_handler: () => void
}

type HeaderState = {

}
const renderHome = ({ paths, num_to_save, upload_handler, icons }: HeaderProps) => {
    const paths_info = paths.map(({ props, key }) => { return { ...props, icon: icons[key], route: useCallback(() => route(props.path), [props.path]) } })
    return (
        <header class="toolbar toolbar-header">
            <h1 class="title">Turbograder</h1>
            <div class="toolbar-actions">
                <div class="btn-group">
                    {
                        paths_info.map(({ path, name, route, icon }) =>
                            <Match key={name} path={path}>
                                {({ matches }: { matches: boolean }) => (
                                    <button class={"btn btn-default" + (matches ? " active" : "")} onClick={route}>
                                        <span class={`icon icon-${icon} icon-text`}></span>
                                        {name}
                                    </button>
                                )}
                            </Match>
                        )
                    }
                </div>
                <Match key="grade" path="/grade">
                    {({ matches }: { matches: boolean }) => (
                        matches &&
                        <button class="btn btn-default pull-right" onClick={upload_handler}>
                            <span class="icon icon-upload icon-text"></span>
                            Submit all ({num_to_save})
                        </button>
                    )}
                </Match>
            </div>
        </header >
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
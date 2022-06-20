import React from "react";
import { CallbackHell } from "./CallbackHell";

export class EventTitleView extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {title: '...'};
        CallbackHell.onTitleLoad = (title: string) => { this.onTitleLoad(title) }
    }

    onTitleLoad(title: string) {
        this.setState({title: title});
        document.title = `Schedulio: ${title}`;
    }

    render() {
        return (
            <h2 id="schedule-title" className="ml-1">{this.state.title}</h2>
        )
    }
}

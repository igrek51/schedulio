import React from "react";

export class ScheduleTitleView extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {title: '...'};
    }

    render() {
        return (
            <h2 id="schedule-title" className="ml-2">{this.state.title}</h2>
        )
    }
}

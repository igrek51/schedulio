import React from "react";
import { registerAllModules } from 'handsontable/registry';
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable/base';
import { BestMatch } from './GridService';

registerAllModules();


export class BestMatchView extends React.Component<any, any> {

    hotTableRef: React.RefObject<HotTable>;
    tableData: string[][];

    constructor(props: any) {
        super(props);
        this.hotTableRef = React.createRef<HotTable>();
        this.tableData = [
            ['Day', 'Time', 'Participants', ''],
        ]
    }

    setBestMatch(bestMatch: BestMatch) {
        let headerRow = ['Day', 'Time', 'Participants']
        for (const name of bestMatch.guest_names) {
            headerRow.push(name)
        }

        let timerange = ''
        let resultRow = [
            bestMatch.day_name,
            timerange,
            `${bestMatch.min_guests}-${bestMatch.max_guests} / ${bestMatch.total_guests}`,
        ]
        for (const vote of bestMatch.guest_votes) {
            resultRow.push(vote)
        }

        this.tableData = [
            headerRow,
            resultRow,
        ]

        let hot = this.hotTableRef.current!.hotInstance!;
        hot.updateData(this.tableData)
    }

    render() {
        const self = this;

        const hotSettings: Handsontable.GridSettings = {
            data: this.tableData,
            rowHeaders: false,
            colHeaders: false,
            width: 'auto',
            height: 'auto',
            colWidths(index: number) {
                if (index === 0) {
                    return 150
                }
                return 100
            },
            fixedRowsTop: 1,
            rowHeights: 40,
            className: 'htCenter htMiddle',
            manualColumnResize: true,
            outsideClickDeselects: true,
            licenseKey: 'non-commercial-and-evaluation',
        };

        return (
            <div id="bestMatchTable">
                <HotTable
                    settings={hotSettings}
                    ref={this.hotTableRef}
                />
            </div>
        );
    }
}

export default BestMatchView;

import React from "react";
import { registerAllModules } from 'handsontable/registry';
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable/base';
import { BestMatch } from './ScheduleService';
import { activateBootstrapTooltips, bestmatchCellRenderer } from "./grid.js";

registerAllModules();


export class BestMatchTable extends React.Component<any, any> {

    hotTableRef: React.RefObject<HotTable>;
    tableData: string[][];

    constructor(props: any) {
        super(props);
        this.hotTableRef = React.createRef<HotTable>();
        this.tableData = [
            ['Criteria', 'Day', 'Time', 'Participants'],
        ]
    }

    setBestMatch(bestMatch: BestMatch | null) {
        if (bestMatch) {
            let headerRow = ['Criteria', 'Day', 'Time', 'Participants']
            for (const name of bestMatch.all_guest_names) {
                headerRow.push(name)
            }
    
            let timerange = `${bestMatch.start_time} - ${bestMatch.end_time}`
            let participantsCell: string
            if (bestMatch.min_guests === bestMatch.max_guests) {
                participantsCell = `${bestMatch.min_guests} / ${bestMatch.total_guests}`
            } else {
                participantsCell = `${bestMatch.min_guests}-${bestMatch.max_guests} / ${bestMatch.total_guests}`
            }
            let resultRow = [
                'Most Participants',
                bestMatch.day_name,
                timerange,
                participantsCell,
            ]
            for (const vote of bestMatch.guest_votes) {
                resultRow.push(vote)
            }
    
            this.tableData = [
                headerRow,
                resultRow,
            ]
        } else {
            this.tableData = [
                ['Criteria', 'Day', 'Time', 'Participants'],
                ['Most Participants', 'Can\'t find any day matching your criteria (insufficient participants)', '', ''],
            ]
        }
    
        let hot = this.hotTableRef.current!.hotInstance!;
        hot.updateData(this.tableData)
    }

    render() {
        function cells(row: number, col: number, prop: string | number): any {
            const cellProperties = { readOnly: false, renderer: bestmatchCellRenderer };
            cellProperties.readOnly = true
            return cellProperties
        }

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
            cells: cells,
            fixedColumnsStart: 0,
            fixedRowsTop: 0,
            rowHeights: 40,
            className: 'htCenter htMiddle',
            manualColumnResize: true,
            outsideClickDeselects: true,
            afterInit: function () {
                activateBootstrapTooltips()
            },
            afterViewRender: function (isForced: boolean) {
                if (isForced) {
                    activateBootstrapTooltips()
                }
            },
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

export default BestMatchTable;

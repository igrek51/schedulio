import React from "react";
import { registerAllModules } from 'handsontable/registry';
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable/base';
import { BestMatch, ScheduleService } from './ScheduleService';
import { activateBootstrapTooltips, bestmatchCellRenderer } from "./grid.js";
import { CallbackHell } from "./CallbackHell";

registerAllModules();


export class BestMatchTable extends React.Component<any, any> {

    hotTableRef: React.RefObject<HotTable>;
    tableData: string[][];
    bestMatchMost: BestMatch | null = null;
    earliestMatch: BestMatch | null = null;

    constructor(props: any) {
        super(props);
        this.hotTableRef = React.createRef<HotTable>();
        this.tableData = [
            ['Criteria', 'Day', 'Time', 'Participants'],
        ]
        CallbackHell.onLoadBestMatch = (bestMatch: BestMatch | null) => { this.onLoadBestMatch(bestMatch) }
        CallbackHell.onLoadEarliestMatch = (bestMatch: BestMatch | null) => { this.onLoadEarliestMatch(bestMatch) }
    }

    onLoadBestMatch(bestMatch: BestMatch | null) {
        this.bestMatchMost = bestMatch
        this.updateTable()
    }
    
    onLoadEarliestMatch(bestMatch: BestMatch | null) {
        this.earliestMatch = bestMatch
        this.updateTable()
    }

    getBestMatchRow(bestMatch: BestMatch | null, algorithm: string): string[] {
        if (bestMatch) {

            let timerange = `${bestMatch.start_time} - ${bestMatch.end_time}`
            let participantsCell: string
            if (bestMatch.min_guests === bestMatch.max_guests) {
                participantsCell = `${bestMatch.min_guests} / ${bestMatch.total_guests}`
            } else {
                participantsCell = `${bestMatch.min_guests}-${bestMatch.max_guests} / ${bestMatch.total_guests}`
            }

            let resultRow = [
                algorithm,
                bestMatch.day_name,
                timerange,
                participantsCell,
            ]
            for (const vote of bestMatch.guest_votes) {
                resultRow.push(vote)
            }
    
            return resultRow
        } else {
            return [algorithm, 'No match (insufficient guests)', '-', '-']
        }
    }

    updateTable() {
        let headerRow = ['Criteria', 'Day', 'Time', 'Participants']
        for (const guest of ScheduleService.guests) {
            headerRow.push(guest.name)
        }

        let matchMostRow = this.getBestMatchRow(this.bestMatchMost, 'Most Participants')
        let earliestMatchRow = this.getBestMatchRow(this.earliestMatch, 'Earliest Match')

        this.tableData = [
            headerRow,
            matchMostRow,
            earliestMatchRow,
        ]
    
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
                if (index <= 1) {
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

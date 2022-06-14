import React from "react";
import { registerAllModules } from 'handsontable/registry';
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable/base';
import { BestMatch, ScheduleService } from './ScheduleService';
import { activateBootstrapTooltips, applyDefaultRenderer } from "./grid.js";
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

        function cellRenderer(
            instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, 
            prop: any, value: Handsontable.CellValue, cellProperties: any) {
            applyDefaultRenderer(instance, td, row, col, prop, value, cellProperties)
        
            td.style.color = '#000000'
            
            let html = value
            let tooltip = ''
            let tooltipPlacement = 'top'
            if (row === instance.countRows() - 1) {
                tooltipPlacement = 'bottom'
            } 
            if (col == 0) {
                tooltipPlacement = 'left'
            }

            if (row === 0) {
                td.style.background = '#F8F9FA'
                td.style.fontWeight = 'bold'
            } else if (row > 0 && col === 1) {
                if (ScheduleService.matchMostDayName !== '' && ScheduleService.matchMostDayName === value) {
                    html = `<svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium icon-star" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarBorderIcon"><path d="m22 9.24-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"></path></svg> ${html}`
                    tooltip = `Best Match - day with the most confirmed participants`
                }

            } else if (row > 0 && col == 3) {
                tooltip = `Number of confirmed - potential participants of total guests`

            } else if (row > 0 && col > 3) {
                const guestIndex = col - 4

                let guestResultsMap: string[] = []
                if (row == 1) {
                    guestResultsMap = ScheduleService.matchMostGuestResults

                } else if (row == 2) {
                    guestResultsMap = ScheduleService.matchEarliestGuestResults
                }

                const guestResult = guestResultsMap[guestIndex]
                if (guestResult) {
                    const guest = ScheduleService.guests[guestIndex]

                    if (guestResult === 'ok') {
                        td.style.color = '#38782E'
                        td.style.background = '#D9EAD3'
                        td.style.fontWeight = 'bold'
                        if (guest) {
                            tooltip = `${guest.name} confirmed to participate`
                        }
                    } else if (guestResult === 'no') {
                        td.style.color = '#AC322C'
                        td.style.background = '#EA9999'
                        if (guest) {
                            tooltip = `${guest.name} can't make it`
                        }
                    } else if (guestResult === 'maybe') {
                        td.style.color = '#71A1D2'
                        td.style.background = '#EEF4FB'
                        if (guest) {
                            tooltip = `${guest.name} maybe will join`
                        }
                    }
                }
            }

            if (tooltip !== '') {
                html = `<div class="py-1" data-toggle="tooltip" data-placement="${tooltipPlacement}" title="${tooltip}">${html}</div>`
                td.title = tooltip
            }
            td.innerHTML = html
        }

        function cells(row: number, col: number, prop: string | number): any {
            const cellProperties = { readOnly: false, renderer: cellRenderer };
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

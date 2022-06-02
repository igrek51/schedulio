import React from "react";
import { registerAllModules } from 'handsontable/registry';
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable/base';
import { cellRenderer } from './grid.js';
import { GridService } from './GridService';
import { TimeRangeField } from "./TimeRangeField.js";

registerAllModules();


export class ScheduleGrid extends React.Component<any, any> {

    hotTableRef: React.RefObject<HotTable>;
    hoursFieldRef: React.RefObject<TimeRangeField>;
    tableData: string[][];

    constructor(props: any) {
        super(props);
        this.state = {
        };
        this.hotTableRef = React.createRef<HotTable>();
        this.hoursFieldRef = props.hoursFieldRef;
        this.tableData = [
            ['Day', ''],
            ['...', ''],
        ]
    }

    setTableData(tableData: string[][]) {
        this.tableData = tableData
        let hot = this.hotTableRef.current!.hotInstance!;
        hot.updateData(tableData)
    }

    render() {
        const self = this;

        function cells(row: number, col: number, prop: string | number): any {
            const cellProperties = { readOnly: false, renderer: cellRenderer };
            if (col === 0) {
                cellProperties.readOnly = true
            } else {
                cellProperties.readOnly = false
            }
            return cellProperties
        }

        function afterSelection(hot: any, row: number, column: number, row2: number, column2: number, preventScrolling: any, selectionLayerLevel: any) {
            const lastRow = hot.countRows() - 1
            if (row === lastRow || row2 === lastRow) {
                GridService.loadMoreVotes()
            }
        }

        function afterSetDataAtCell(hot: any, changes: Array<any>) {
            if (changes) {
                const lastCol = hot.countCols() - 1
                const lastRow = hot.countRows() - 1
                const voteChanges: Array<any> = []
                changes.forEach(([row, col, oldValue, newValue]) => {
                    if (row === 0 && col === lastCol && newValue) {
                        GridService.addNewGuest(newValue)
                    } else if (row > 0 && row < lastRow && col > 0 && col < lastCol) {
                        voteChanges.push([row, col, newValue])
                    } else if (row === 0 && col > 0 && col < lastCol) {
                        GridService.renameGuest(col - 1, newValue)
                    }
                })
                if (voteChanges.length > 0) {
                    GridService.sendVotes(voteChanges)
                }
            }
        }

        const hotSettings: Handsontable.GridSettings = {
            data: this.tableData,
            rowHeaders: false,
            colHeaders: false,
            width: 'auto',
            height: '60vh',
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
            cells: cells,
            contextMenu: {
                items: {
                    vote_ok: {
                        name: 'OK - I\'m available',
                        callback(_key: any, _selection: any, _clickEvent: any) {
                            GridService.setSelectedCells('ok')
                        }
                    },
                    vote_ok_hours: {
                        name: 'OK within time range',
                        callback(_key: any, _selection: any, _clickEvent: any) {
                            self.hoursFieldRef.current!.setAvailabilityHours()
                        }
                    },
                    vote_maybe: {
                        name: '(empty) - maybe',
                        callback(_key: any, _selection: any, _clickEvent: any) {
                            GridService.setSelectedCells('')
                        }
                    },
                    vote_no: {
                        name: 'No - I can\'t',
                        callback(_key: any, _selection: any, _clickEvent: any) {
                            GridService.setSelectedCells('no')
                        }
                    },
                },
            },
            outsideClickDeselects: false,
            selectionMode: 'multiple',
            afterSelection: function (row: number, column: number, row2: number, column2: number, preventScrolling: any, selectionLayerLevel: any) {
                afterSelection(this, row, column, row2, column2, preventScrolling, selectionLayerLevel)
            },
            afterSetDataAtCell: function (changes: Array<any>) {
                afterSetDataAtCell(this, changes);
            },
            licenseKey: 'non-commercial-and-evaluation',
        };

        return (
            <HotTable
                settings={hotSettings}
                ref={this.hotTableRef}
            />
        );
    }
}

export default ScheduleGrid;

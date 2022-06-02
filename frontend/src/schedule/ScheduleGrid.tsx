import React from "react";
import { registerAllModules } from 'handsontable/registry';
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable/base';
import { cellRenderer } from './grid.js';
import { GridService } from './GridService';
import { TimeRangeField } from "./TimeRangeField";
import { ToastService } from "./ToastService";

registerAllModules();


export class ScheduleGrid extends React.Component<any, any> {

    hotTableRef: React.RefObject<HotTable>;
    hoursFieldRef: React.RefObject<TimeRangeField>;
    tableData: string[][];

    constructor(props: any) {
        super(props);
        this.state = {
            constantFocus: true,
        };
        this.hotTableRef = React.createRef<HotTable>();
        this.hoursFieldRef = props.hoursFieldRef;
        this.tableData = [
            ['Day'],
            ['...'],
        ]
    }

    disableConstantFocus() {
        this.setState({constantFocus: false});
        let hot = this.hotTableRef.current!.hotInstance!;
        hot.deselectCell();
    }

    enableConstantFocus() {
        this.setState({constantFocus: true});
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
                const lastRow = hot.countRows() - 1
                const voteChanges: Array<any> = []
                changes.forEach(([row, col, oldValue, newValue]) => {
                    if (newValue !== oldValue) {
                        if (row > 0 && row < lastRow && col > 0) {
                            voteChanges.push([row, col, newValue])
                        } else if (row === 0 && col > 0) {
                            GridService.renameGuest(col - 1, newValue)
                            return
                        }
                    }
                })
                if (voteChanges.length === 0 && changes.length !== voteChanges.length) {
                    return
                }
                GridService.sendVotes(voteChanges)
            }
        }

        function isSelectedHeader(this: Handsontable): boolean {
            const selectedLast = this.getSelectedLast()
            if (selectedLast === undefined) {
                return false
            }
            return selectedLast[0] === 0 || selectedLast[1] === 0;
        }

        function isNotSelectedGuestHeader(this: Handsontable): boolean {
            const selectedLast = this.getSelectedLast()
            if (selectedLast === undefined) {
                return false
            }
            return selectedLast[0] > 0 || selectedLast[1] === 0;
        }

        function deleteSelectedGuest(hot: Handsontable) {
            const selected = hot.getSelected() || []
            if (selected.length === 0) {
                return
            }
            if (selected.length > 1) {
                ToastService.toastError('Please select only one guest')
                return
            }
            const [_row1, column1, _row2, _column2] = selected[0]
            const guestIndex = column1 - 1
            GridService.deleteGuest(guestIndex)
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
            fixedColumnsStart: 1,
            fixedRowsTop: 1,
            rowHeights: 40,
            className: 'htCenter htMiddle',
            manualColumnResize: true,
            cells: cells,
            contextMenu: {
                items: {
                    vote_ok: {
                        name: 'Set "OK" (I\'m available)',
                        callback(_key: any, _selection: any, _clickEvent: any) {
                            GridService.setSelectedCells('ok')
                        },
                        hidden: isSelectedHeader,
                    },
                    vote_ok_hours: {
                        name: 'Specify availability time range',
                        callback(_key: any, _selection: any, _clickEvent: any) {
                            self.hoursFieldRef.current!.setAvailabilityHours()
                        },
                        hidden: isSelectedHeader,
                    },
                    vote_maybe: {
                        name: 'Set empty (Maybe)',
                        callback(_key: any, _selection: any, _clickEvent: any) {
                            GridService.setSelectedCells('')
                        },
                        hidden: isSelectedHeader,
                    },
                    vote_no: {
                        name: 'Set "No" (I can\'t)',
                        callback(_key: any, _selection: any, _clickEvent: any) {
                            GridService.setSelectedCells('no')
                        },
                        hidden: isSelectedHeader,
                    },
                    guest_delete: {
                        name: 'Delete this guest',
                        callback(this: Handsontable, _key: any, _selection: any, _clickEvent: any) {
                            deleteSelectedGuest(this)
                        },
                        hidden: isNotSelectedGuestHeader,
                    },
                },
            },
            outsideClickDeselects(event) {
                return !self.state.constantFocus;
            },
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

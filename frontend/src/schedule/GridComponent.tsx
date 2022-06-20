import React from "react";
import { registerAllModules } from 'handsontable/registry';
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable/base';
import { applyDefaultRenderer, activateBootstrapTooltips } from './grid.js';
import { ScheduleService } from './ScheduleService';
import { TimeRangeField } from "./TimeRangeField";
import { ToastService } from "./ToastService";
import { CallbackHell } from "./CallbackHell";

registerAllModules();


export class GridComponent extends React.Component<any, any> {

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
        ScheduleService.scheduleGridRef = this;
        ScheduleService.hotRef = this.hotTableRef;
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

        function cellRenderer(
            instance: Handsontable, td: HTMLTableCellElement, row: number, col: number, 
            prop: any, value: Handsontable.CellValue, cellProperties: any) {
            applyDefaultRenderer(instance, td, row, col, prop, value, cellProperties)

            if (row === 0) {
                td.style.color = '#000000'
                td.style.background = '#F8F9FA'
                td.style.fontWeight = 'bold'
                
                if (col === 0) {
                    let tooltip = 'Next days shift automatically each day'
                    td.innerHTML = `<div class="py-1" data-toggle="tooltip" data-placement="left" title="${tooltip}">${value}</div>`
                } else {
                    let tooltip = 'Double click to rename, right click to delete'
                    td.innerHTML = `<div class="py-1" data-toggle="tooltip" data-placement="top" title="${tooltip}">${value}</div>`
                }
        
            } else if (col === 0) {
                td.style.color = '#000000'
                td.style.background = '#FFFFFF'
                const dayOfWeek = ScheduleService.timestampToDayOfWeek[value]
                if (dayOfWeek !== undefined) {
                    if (dayOfWeek === 6) {  // saturday
                        td.style.background = '#FAE8DC'
                    } else if (dayOfWeek === 0) {  // sunday
                        td.style.background = '#FAE8DC'
                    }
                }
        
                let html = value
                let tooltip = ''
        
                if (row === 1) {
                    tooltip = 'Today (next days shift automatically each day)'
                }
                if (row === instance.countRows() - 1) {
                    tooltip = 'Click to show more days'
                }
        
                if (ScheduleService.bestMatchDayName !== '' && ScheduleService.bestMatchDayName === value) {
                    html = `<svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium icon-star" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarBorderIcon"><path d="m22 9.24-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"></path></svg> ${html}`
                    if (row === 1) {
                        tooltip = `Best match (It's today!)`
                    } else {
                        tooltip = `Best match`
                    }
                } else if (ScheduleService.soonestMatchDayName !== '' && ScheduleService.soonestMatchDayName === value) {
                    html = `<svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium icon-star" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="BoltIcon"><path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"></path></svg> ${html}`
                    if (row === 1) {
                        tooltip = `Soonest possible match (It's today!)`
                    } else {
                        tooltip = `Soonest possible match`
                    }
                }
        
                if (tooltip !== '') {
                    html = `<div class="py-1" data-toggle="tooltip" data-placement="left" title="${tooltip}">${html}</div>`
                    td.title = tooltip
                }
                td.innerHTML = html
        
            } else if (value === 'ok') {
                td.style.color = '#38782E'
                td.style.background = '#D9EAD3'
                td.style.fontWeight = 'bold'
            } else if (value === 'no') {
                td.style.color = '#AC322C'
                td.style.background = '#EA9999'
            } else if (value === 'maybe') {
                td.style.color = '#71A1D2'
                td.style.background = '#EEF4FB'
            } else if (value === '' || !value) {
                td.style.color = '#000000'
                td.style.background = '#FFFFFF'
            } else {
                td.style.color = '#000000'
                td.style.background = '#FFF2CC'
                td.style.fontWeight = 'bold'
            }
        }

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
                ScheduleService.loadMoreDays()
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
                            ScheduleService.renameGuest(col - 1, newValue)
                            return
                        }
                    }
                })
                if (voteChanges.length === 0 && changes.length !== voteChanges.length) {
                    return
                }
                ScheduleService.sendVotes(voteChanges)
            }
        }

        function isSelectedHeader(this: Handsontable): boolean {
            const selectedLast = this.getSelectedLast()
            if (selectedLast === undefined) {
                return false
            }
            return selectedLast[0] === 0 || selectedLast[1] === 0;
        }

        function isNotSelectedHeaderRow(this: Handsontable): boolean {
            const selectedLast = this.getSelectedLast()
            if (selectedLast === undefined) {
                return false
            }
            return selectedLast[0] > 0;
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
            ScheduleService.deleteGuest(guestIndex)
        }

        const hotSettings: Handsontable.GridSettings = {
            data: this.tableData,
            rowHeaders: false,
            colHeaders: false,
            width: 'auto',
            height: '60vh',
            colWidths(index: number) {
                if (index === 0) {
                    return 140
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
                        name: 'OK (I\'m available)',
                        callback(_key: any, _selection: any, _clickEvent: any) {
                            ScheduleService.setSelectedCells('ok')
                        },
                        hidden: isSelectedHeader,
                    },
                    vote_ok_hours: {
                        name: 'Time range (available under condition)',
                        callback(_key: any, _selection: any, _clickEvent: any) {
                            self.hoursFieldRef.current!.setAvailabilityHours()
                        },
                        hidden: isSelectedHeader,
                    },
                    vote_maybe: {
                        name: 'Maybe',
                        callback(_key: any, _selection: any, _clickEvent: any) {
                            ScheduleService.setSelectedCells('maybe')
                        },
                        hidden: isSelectedHeader,
                    },
                    vote_no: {
                        name: 'No (I can\'t)',
                        callback(_key: any, _selection: any, _clickEvent: any) {
                            ScheduleService.setSelectedCells('no')
                        },
                        hidden: isSelectedHeader,
                    },
                    vote_clear: {
                        name: 'Clear',
                        callback(_key: any, _selection: any, _clickEvent: any) {
                            ScheduleService.setSelectedCells('')
                        },
                        hidden: isSelectedHeader,
                    },
                    guest_add: {
                        name: 'Add new guest',
                        callback(this: Handsontable, _key: any, _selection: any, _clickEvent: any) {
                            CallbackHell.newGuestViewClickOpen()
                        },
                        hidden: isNotSelectedHeaderRow,
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
            <HotTable
                settings={hotSettings}
                ref={this.hotTableRef}
                />
        );
    }
}

export default GridComponent;

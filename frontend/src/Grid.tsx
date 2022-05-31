import 'react-toastify/dist/ReactToastify.css';
import { registerAllModules } from 'handsontable/registry';
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable/base';
import { addNewGuest, loadMoreVotes, renameGuest, sendVotes, setSelectedCells, voteOkHours } from './rest';

registerAllModules();

let tableData = [
  ['Day', ''],
  ['...', ''],
]

function ScheduleGrid() {
  
  function cellRenderer(instance: any, td: any, row: number, col: number, prop: number, value: string, cellProperties: any) {
    // Handsontable.renderers.TextRenderer(instance, td, row, col, prop, value, cellProperties);
    if (row === 0) {
        td.style.color = '#000000'
        td.style.background = '#F8F9FA'
        td.style.fontWeight = 'bold'
        if (col === instance.countCols() - 1) {
            td.innerHTML = '<u>Name</u>'
        }
    } else if (col === 0) {
        td.style.color = '#000000'
        td.style.background = '#FFFFFF'
    } else if (value === 'ok') {
        td.style.color = '#38782E'
        td.style.background = '#D9EAD3'
        td.style.fontWeight = 'bold'
    } else if (value === 'no') {
        td.style.color = '#AC322C'
        td.style.background = '#EA9999'
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
      const cellProperties = {readOnly: false, renderer: cellRenderer};
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
        loadMoreVotes()
    }
  }

  function afterSetDataAtCell(hot: any, changes: Array<any>) {
    if (changes) {
        const lastCol = hot.countCols() - 1
        const lastRow = hot.countRows() - 1
        const voteChanges: Array<any> = []
        changes.forEach(([row, col, oldValue, newValue]) => {
            if (row === 0 && col === lastCol && newValue) {
                addNewGuest(newValue)
            } else if (row > 0 && row < lastRow && col > 0 && col < lastCol) {
                voteChanges.push([row, col, newValue])
            } else if (row === 0 && col > 0 && col < lastCol) {
                renameGuest(col - 1, newValue)
            }
        })
        if (voteChanges.length > 0) {
            sendVotes(voteChanges)
        }
    }
  }

  const hotSettings: Handsontable.GridSettings = {
    data: tableData,
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
    cells: cells,
    contextMenu: {
        items: {
            vote_ok: {
                name: 'ok',
                callback(_key: any, _selection: any, _clickEvent: any) {
                    setSelectedCells('ok')
                }
            },
            vote_ok_hours: {
                name: 'ok with hours',
                callback(_key: any, _selection: any, _clickEvent: any) {
                    voteOkHours()
                }
            },
            vote_maybe: {
                name: '(maybe)',
                callback(_key: any, _selection: any, _clickEvent: any) {
                    setSelectedCells('')
                }
            },
            vote_no: {
                name: 'no',
                callback(_key: any, _selection: any, _clickEvent: any) {
                    setSelectedCells('no')
                }
            },
        },
    },
    outsideClickDeselects: false,
    selectionMode: 'multiple',
    afterSelection: function(row: number, column: number, row2: number, column2: number, preventScrolling: any, selectionLayerLevel: any) {
        afterSelection(this, row, column, row2, column2, preventScrolling, selectionLayerLevel)
    },
    afterSetDataAtCell: function(changes: Array<any>) {
        afterSetDataAtCell(this, changes);
    },
    licenseKey: 'non-commercial-and-evaluation',
  };

  return (
    <div id="scheduleTable">
        <HotTable
            settings={hotSettings}
        />
    </div>
  );
}

export default ScheduleGrid;

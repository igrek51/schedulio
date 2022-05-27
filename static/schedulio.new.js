const data = [
    ['Day', 'Alice', 'Bob', 'Charlie', 'David'],
    ['Mon 2022-05-23', 'ok', '21-24', 'no', ''],
    ['Tue 2022-05-24', 'ok', '21-24', 'no', ''],
    ['Wed 2022-05-25', 'ok', '21-24', 'no', ''],
    ['Thu 2022-05-26', '', '', '', ''],
    ['Fri 2022-05-27', '', '', '', ''],
]
  
function celRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments)
    if (row == 0) {
        td.style.color = '#000000'
        td.style.background = '#F8F9FA'
        td.style.fontWeight = 'bold'
    } else if (col == 0) {
        td.style.color = '#000000'
        td.style.background = '#FFFFFF'
    } else if (value == 'ok') {
        td.style.color = '#38782E'
        td.style.background = '#D9EAD3'
        td.style.fontWeight = 'bold'
    } else if (value == 'no') {
        td.style.color = '#AC322C'
        td.style.background = '#EA9999'
    } else if (value == '' || value == null || value == undefined) {
        td.style.color = '#000000'
        td.style.background = '#FFFFFF'
    } else {
        td.style.color = '#000000'
        td.style.background = '#FFF2CC'
        td.style.fontWeight = 'bold'
    }
}

function afterSelection(row, column, row2, column2, preventScrolling, selectionLayerLevel) {
    lastRow = hot.countRows() - 1
    if (row == lastRow || row2 == lastRow) {
        loadMoreData(7)
    }
}

function loadMoreData(n) {
    for (let i = 0; i < n; i += 1) {
        data.push(['Sat 2022-05-27', '', '', '', ''])
    }
    hot.updateData(data)
    hot.render()
}

const container = document.getElementById('scheduleTable')
const hot = new Handsontable(container, {
    data: data,
    rowHeaders: false,
    colHeaders: false,
    width: 'auto',
    height: 'auto',
    colWidths(index) {
        if (index == 0) {
            return 150
        }
        return 100
    },
    fixedRowsTop: 1,
    rowHeights: 40,
    className: 'htCenter htMiddle',
    manualColumnResize: true,
    cells(row, col) {
        const cellProperties = {}
        if (col == 0) {
            cellProperties.readOnly = true
        } else {
            cellProperties.readOnly = false
        }
        cellProperties.renderer = celRenderer
        return cellProperties
    },
    contextMenu: {
        items: {
            vote_ok: {
                name: 'ok',
                callback(key, selection, clickEvent) {
                    setSelectedCells('ok')
                }
            },
            vote_ok_hours: {
                name: 'ok with hours',
                callback(key, selection, clickEvent) {
                    voteOkHours()
                }
            },
            vote_maybe: {
                name: '(maybe)',
                callback(key, selection, clickEvent) {
                    setSelectedCells('')
                }
            },
            vote_no: {
                name: 'no',
                callback(key, selection, clickEvent) {
                    setSelectedCells('no')
                }
            },
        },
    },
    outsideClickDeselects: false,
    selectionMode: 'multiple',
    afterSelection: afterSelection,
    licenseKey: 'non-commercial-and-evaluation',
})

$("#btn-answer-ok").click(function () {
    setSelectedCells('ok')
})

$("#btn-answer-maybe").click(function () {
    setSelectedCells('')
})

$("#btn-answer-no").click(function () {
    setSelectedCells('no')
})

$("#btn-answer-hours").click(function () {
    voteOkHours()
})

function voteOkHours() {
    value = $(`#input-answer-hours`).val()
    setSelectedCells(value)
}

function setSelectedCells(value) {
    const selected = hot.getSelected() || []
    hot.suspendRender()

    for (let index = 0; index < selected.length; index += 1) {
        const [row1, column1, row2, column2] = selected[index]
        const startRow = Math.max(Math.min(row1, row2), 1)
        const endRow = Math.max(row1, row2)
        const startCol = Math.max(Math.min(column1, column2), 1)
        const endCol = Math.max(column1, column2)

        for (let rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
            for (let columnIndex = startCol; columnIndex <= endCol; columnIndex += 1) {
                hot.setDataAtCell(rowIndex, columnIndex, value)
            }
        }
    }
  
    hot.render()
    hot.resumeRender()
}

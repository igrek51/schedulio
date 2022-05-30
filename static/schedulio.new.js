let tableData = [
    ['Day', ''],
]

function celRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments)
    if (row == 0) {
        td.style.color = '#000000'
        td.style.background = '#F8F9FA'
        td.style.fontWeight = 'bold'
        if (col == instance.countCols() - 1) {
            td.innerHTML = '<u>Name</u>'
        }
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
        loadMoreVotes()
    }
}

function afterSetDataAtCell(changes) {
    if (changes) {
        const lastCol = hot.countCols() - 1
        const lastRow = hot.countRows() - 1
        const voteChanges = []
        changes.forEach(([row, col, oldValue, newValue]) => {
            if (row == 0 && col == lastCol && newValue) {
                addNewGuest(newValue)
            } else if (row > 0 && row < lastRow && col > 0 && col < lastCol) {
                voteChanges.push([row, col, newValue])
            } else if (row == 0 && col > 0 && col < lastCol) {
                renameGuest(col - 1, newValue)
            }
        })
        if (voteChanges.length > 0) {
            sendVotes(voteChanges)
        }
    }
}

const container = document.getElementById('scheduleTable')
const hot = new Handsontable(container, {
    data: tableData,
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
    afterSetDataAtCell: afterSetDataAtCell,
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
    hot.suspendRender()
    const selected = hot.getSelected() || []
    const lastCol = hot.countCols() - 2
    const lastRow = hot.countRows() - 2

    for (let index = 0; index < selected.length; index += 1) {
        const [row1, column1, row2, column2] = selected[index]
        const startRow = Math.max(Math.min(row1, row2), 1)
        const endRow = Math.min(Math.max(row1, row2), lastRow)
        const startCol = Math.max(Math.min(column1, column2), 1)
        const endCol = Math.min(Math.max(column1, column2), lastCol)

        for (let rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
            for (let columnIndex = startCol; columnIndex <= endCol; columnIndex += 1) {
                hot.setDataAtCell(rowIndex, columnIndex, value)
            }
        }
    }
  
    hot.render()
    hot.resumeRender()
}

$('[data-bs-toggle="tooltip"]').each(function(i, obj) {
    new bootstrap.Tooltip(obj)
})


let dayVotes = []
let guests = []
let guestsById = {}
let guestIdToIndex = {}

$(document).ready(function() {
    ajaxRequest('get', `/api/schedule/${scheduleId}`, function(data) {
        $("#schedule-title").html(data.title)
    })
    
    ajaxRequest('get', `/api/schedule/${scheduleId}/guest`, function(data) {
        guests = data
        guests.forEach(function (guest, i) {
            guestsById[guest.id] = guest
            guestIdToIndex[guest.id] = i
        })
        refreshAllVotes()
    })

    ajaxRequest('get', `/api/schedule/${scheduleId}/votes`, function(data) {
        dayVotes = data.day_votes
        refreshAllVotes()
    })
})

function refreshAllVotes() {
    hot.suspendRender()

    let guestsNum = guests.length
    let headerRow = ['Day']
    for (const guest of guests) {
        headerRow.push(guest.name)
    }
    headerRow.push('<u>Add</u>')
    let guestEmptyColumns = Array(guestsNum + 1).fill('')

    tableData = [headerRow]
    for (const dayVote of dayVotes) {

        let guestCells = Array(guestsNum + 1).fill('')
        for (const [guestId, answer] of Object.entries(dayVote.guest_votes)) {
            const guestIndex = guestIdToIndex[guestId]
            guestCells[guestIndex] = answer
        }

        const row = [dayVote.day_name].concat(guestCells)
        tableData.push(row)
    }
    tableData.push(['...'].concat(guestEmptyColumns))

    hot.updateData(tableData)
    hot.render()
    hot.resumeRender()
}

function loadMoreVotes() {
    lastDay = dayVotes[dayVotes.length - 1].day_timestamp
    ajaxRequest('get', `/api/schedule/${scheduleId}/votes/more/${lastDay}`, function(data) {

        let guestsNum = guests.length
        let guestEmptyColumns = Array(guestsNum + 1).fill('')

        batchVotes = data.day_votes
        tableData.pop()
        for (let i = 0; i < batchVotes.length; i += 1) {
            const dayVote = batchVotes[i]
            dayVotes.push(dayVote)
            tableData.push([dayVote.day_name].concat(guestEmptyColumns))
        }
        tableData.push(['...'].concat(guestEmptyColumns))

        hot.updateData(tableData)
        hot.render()
    })
}

function addNewGuest(name) {
    ajaxPayloadRequest('post', `/api/schedule/${scheduleId}/guest`, {'name': name}, function(data) {
        guests.push(data)
        guests.forEach(function (guest, i) {
            guestsById[guest.id] = guest
            guestIdToIndex[guest.id] = i
        })
        console.log('new guest created:', name)
        refreshAllVotes()
    })
}

function getGuestByColumn(column) {
    return guests[column - 1]
}

function getDayTimestampByRow(row) {
    const dayVote = dayVotes[row - 1]
    return dayVote.day_timestamp
}

function sendVotes(voteChanges) {
    let votes = []
    let guestId = 0

    voteChanges.forEach(([row, col, newValue]) => {
        const guest = getGuestByColumn(col)
        if (guestId == 0) {
            guestId = guest.id
        } else if (guestId != guest.id) {
            throw new Error('Found votes for different guests in one batch')
        }

        let answer = newValue
        if (!answer) {
            answer = ''
        }
        const day = getDayTimestampByRow(row)

        votes.push({
            day: day,
            answer: answer,
        })
    })

    ajaxPayloadRequest('post', `/api/guest/${guestId}/votes`, votes, function(data) {
        console.log(`${votes.length} votes sent for guest: ${guestId}`)
    })
}

function renameGuest(guestIndex, newName) {
    const guest = guests[guestIndex]
    ajaxPayloadRequest('put', `/api/guest/${guest.id}`, {name: newName}, function(data) {
        guest.name = newName
        console.log(`Guest renamed to ${newName}`)
    })
}

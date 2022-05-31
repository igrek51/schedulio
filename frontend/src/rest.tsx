export { loadMoreVotes, addNewGuest, sendVotes, renameGuest, voteOkHours, setSelectedCells };

export function refreshAllVotes() {
    
}

function loadMoreVotes() {
    // const lastDay = dayVotes[dayVotes.length - 1].day_timestamp
    // ajaxRequest('get', `/api/schedule/${scheduleId}/votes/more/${lastDay}`, function(data) {

    //     let guestsNum = guests.length
    //     let guestEmptyColumns = Array(guestsNum + 1).fill('')

    //     batchVotes = data.day_votes
    //     tableData.pop()
    //     for (let i = 0; i < batchVotes.length; i += 1) {
    //         const dayVote = batchVotes[i]
    //         dayVotes.push(dayVote)
    //         tableData.push([dayVote.day_name].concat(guestEmptyColumns))
    //     }
    //     tableData.push(['...'].concat(guestEmptyColumns))

    //     hot.updateData(tableData)
    //     hot.render()
    // })
}

function addNewGuest(name: string) {
}

function sendVotes(voteChanges: Array<any>) {
}

function renameGuest(guestIndex: any, newName: string) {
}

function voteOkHours() {
}

function setSelectedCells(value: any) {
}

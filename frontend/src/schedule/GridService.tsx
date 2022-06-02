import React from "react";
import { toast } from 'react-toastify';
import axios from "axios";
import { HotTable } from '@handsontable/react';
import ScheduleGrid from "./ScheduleGrid";


interface Guest {
    id: string;
    schedule_id: string;
    name: string;
    create_time: number;
    last_update: number;
}

interface DayVotes {
    day_timestamp: number;
    day_name: string;
    day_of_week: number;
    guest_votes: Record<string, string>;
}

interface Vote {
    day: number;
    answer: string;
}

export interface BestMatch {
    day_timestamp: number;
    day_name: string;
    start_time: string | null;
    end_time: string | null;
    min_guests: number;
    max_guests: number;
    total_guests: number;
    guest_votes: string[];
    guest_names: string[];
    algorithm: string;
    place: number | null;
}

export class GridService {
    static title: string = '...';
    static guests: Array<Guest> = [];
    static dayVotes: Array<DayVotes> = [];
    static scheduleId: string = '';
    static guestsById: Record<string, Guest> = {};
    static guestIdToIndex: Record<string, number> = {};
    static hotRef: React.RefObject<HotTable>;
    static scheduleGridRef: React.RefObject<ScheduleGrid>;
    static timestampToDayOfWeek: Record<string, number> = {};

    static toastInfo(msg: string) {
        toast.info(msg, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }

    static toastError(msg: string) {
        toast.error(msg, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }

    static toastSuccess(msg: string) {
        toast.success(msg, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }

    static fetchData(
        onTitleLoad: (title: string) => void,
        onBestMatchLoad: (bestMatch: BestMatch) => void,
        ) {
        console.log('loading data...');

        axios.get(`/api/schedule/${this.scheduleId}`)
            .then(response => {
                this.title = response.data.title;
                onTitleLoad(this.title);
            }).catch(response => {
                this.toastError(`Fetching schedule: ${response}`);
            });

        axios.get(`/api/schedule/${this.scheduleId}/guest`)
            .then(response => {
                let guests = response.data
                const self: any = this;
                guests.forEach(function (guest: Guest, i: number) {
                    self.guestsById[guest.id] = guest
                    self.guestIdToIndex[guest.id] = i
                })
                this.guests = guests
                this.refreshAllVotes()
            }).catch(response => {
                this.toastError(`Fetching guests: ${response}`);
            });

        axios.get(`/api/schedule/${this.scheduleId}/votes`)
            .then(response => {
                let dayVotes = response.data.day_votes
                this.dayVotes = dayVotes
                this.refreshAllVotes()
            }).catch(response => {
                this.toastError(`Fetching votes: ${response}`);
            });

        axios.get(`/api/schedule/${this.scheduleId}/match/most_participants`)
            .then(response => {
                let bestMatch = response.data
                onBestMatchLoad(bestMatch)
            }).catch(response => {
                this.toastError(`Fetching matches: ${response}`);
            });
    }

    static refreshAllVotes() {
        let hot = this.hotRef.current!.hotInstance!;
        hot.suspendRender()

        const guestsNum = this.guests.length
        let headerRow = ['Day']
        for (const guest of this.guests) {
            headerRow.push(guest.name)
        }
        headerRow.push('')
        let guestEmptyColumns = Array(guestsNum + 1).fill('')
    
        let tableData = [headerRow]
        for (const dayVote of this.dayVotes) {
    
            let guestCells = Array(guestsNum + 1).fill('')
            for (const [guestId, answer] of Object.entries(dayVote.guest_votes)) {
                const guestIndex = this.guestIdToIndex[guestId]
                guestCells[guestIndex] = answer
            }
    
            this.timestampToDayOfWeek[dayVote.day_name] = dayVote.day_of_week
            const row = [dayVote.day_name].concat(guestCells)
            tableData.push(row)
        }
        tableData.push(['...'].concat(guestEmptyColumns))

        this.scheduleGridRef.current!.setTableData(tableData)

        hot.render()
        hot.resumeRender()
    }

    static loadMoreVotes() {
        let lastDay = 0
        if (this.dayVotes.length > 0) {
            lastDay = this.dayVotes[this.dayVotes.length - 1].day_timestamp
        }
        
        axios.get(`/api/schedule/${this.scheduleId}/votes/more/${lastDay}`)
            .then(response => {

                let guestsNum = this.guests.length
                let guestEmptyColumns = Array(guestsNum + 1).fill('')
        
                const batchVotes = response.data.day_votes

                const scheduleGrid = this.scheduleGridRef.current!
                const tableData = scheduleGrid.tableData

                tableData.pop()
                for (const dayVote of batchVotes) {
                    this.timestampToDayOfWeek[dayVote.day_name] = dayVote.day_of_week
                    this.dayVotes.push(dayVote)
                    tableData.push([dayVote.day_name].concat(guestEmptyColumns))
                }
                tableData.push(['...'].concat(guestEmptyColumns))
        
                let hot = this.hotRef.current!.hotInstance!;
                hot.updateData(tableData)
                hot.render()
                
            }).catch(response => {
                this.toastError(`Loading more days: ${response}`);
            });
    }

    static addNewGuest(name: string) {
        axios.post(`/api/schedule/${this.scheduleId}/guest`, {name: name})
            .then(response => {

                this.guests.push(response.data)
                const self: any = this;
                this.guests.forEach(function (guest, i) {
                    self.guestsById[guest.id] = guest
                    self.guestIdToIndex[guest.id] = i
                })
                console.log('new guest created:', name)
                this.refreshAllVotes()

            }).catch(response => {
                this.toastError(`Creating guest: ${response}`);
            });
    }

    static getGuestByColumn(column: number): Guest {
        return this.guests[column - 1]
    }
    
    static getDayTimestampByRow(row: number): number {
        const dayVote = this.dayVotes[row - 1]
        return dayVote.day_timestamp
    }

    static sendVotes(voteChanges: Array<any>) {
        const votes: Vote[] = []
        let guestId: string = ''
    
        voteChanges.forEach(([row, col, newValue]) => {
            const guest = this.getGuestByColumn(col)
            if (guestId === '') {
                guestId = guest.id
            } else if (guestId !== guest.id) {
                throw new Error('Found votes for different guests in one batch')
            }
    
            let answer = newValue
            if (!answer) {
                answer = ''
            }
            const day = this.getDayTimestampByRow(row)
    
            votes.push({
                day: day,
                answer: answer,
            })
        })
    
        axios.post(`/api/guest/${guestId}/votes`, votes)
            .then(response => {
                console.log(`sent ${votes.length} votes of guest: ${guestId}`)
                
            }).catch(response => {
                this.toastError(`Sending votes: ${response}`);
            });
    }

    static renameGuest(guestIndex: any, newName: string) {
        const guest = this.guests[guestIndex]
        axios.put(`/api/guest/${guest.id}`, {name: newName})
            .then(response => {
                guest.name = newName
                console.log(`Guest renamed to ${newName}`)

            }).catch(response => {
                this.toastError(`Renaming guest: ${response}`);
            });
    }

    static voteOkHours(value: string) {
        this.setSelectedCells(value)
    }

    static setSelectedCells(value: string) {
        let hot = this.hotRef.current!.hotInstance!;
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

};

import React from "react";
import axios from "axios";
import { HotTable } from '@handsontable/react';
import GridComponent from "./GridComponent";
import { ToastService } from "./ToastService";
import { CallbackHell } from "./CallbackHell";


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

interface Schedule {
    id: string
    path_id: string
    title: string
    description: string | null
    create_time: number
    options: string | null
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
    all_guest_names: string[];
    guest_results: string[];
    algorithm: string;
    place: number | null;
}

export interface ScheduleOptions {
    min_guests: number | null;
    min_duration: string | null;
    default_start_time: string | null;
    default_end_time: string | null;
}

export class ScheduleService {
    static scheduleId: string = '';
    static title: string = '...';
    static scheduleOptionsJson: string | null = '';
    static scheduleOptions: ScheduleOptions | null;
    static guests: Guest[] = [];
    static dayVotes: Array<DayVotes> = [];
    static guestsById: Record<string, Guest> = {};
    static guestIdToIndex: Record<string, number> = {};
    static hotRef: React.RefObject<HotTable>;
    static scheduleGridRef: React.RefObject<GridComponent>;
    static timestampToDayOfWeek: Record<string, number> = {};

    static matchMostDayName: string = '';
    static matchEarliestDayName: string = '';
    static matchMostGuestResults: string[] = [];
    static matchEarliestGuestResults: string[] = [];

    static fetchData(
        onTitleLoad: (title: string) => void,
        ) {
        console.log('loading data...');

        axios.get(`/api/schedule/${this.scheduleId}`)
            .then(response => {
                const schedule: Schedule = response.data;
                this.title = schedule.title;
                this.scheduleOptionsJson = schedule.options;
                if (schedule.options === null || schedule.options === '') {
                    this.scheduleOptions = {
                        min_guests: null,
                        min_duration: null,
                        default_start_time: null,
                        default_end_time: null,
                    }
                } else {
                    this.scheduleOptions = JSON.parse(schedule.options)
                }
                onTitleLoad(this.title);

            }).catch(err => {
                ToastService.showAxiosError(`Fetching schedule`, err)
            });

        axios.get(`/api/schedule/${this.scheduleId}/guest`)
            .then(response => {
                const guests: Guest[] = response.data
                const self: any = this;
                guests.forEach(function (guest: Guest, i: number) {
                    self.guestsById[guest.id] = guest
                    self.guestIdToIndex[guest.id] = i
                })
                this.guests = guests
                this.refreshAllVotes()

            }).catch(err => {
                ToastService.showAxiosError(`Fetching guests`, err)
            });

        axios.get(`/api/schedule/${this.scheduleId}/votes`)
            .then(response => {
                const dayVotes: DayVotes[] = response.data.day_votes
                this.dayVotes = dayVotes
                this.refreshAllVotes()

            }).catch(err => {
                ToastService.showAxiosError(`Fetching votes`, err)
            });

        axios.get(`/api/schedule/${this.scheduleId}/match/most_participants`)
            .then(response => {
                const bestMatch: BestMatch = response.data
                if (bestMatch === null) {
                    this.matchMostDayName = ''
                    this.matchMostGuestResults = []
                } else {
                    this.matchMostDayName = bestMatch.day_name
                    this.matchMostGuestResults = bestMatch.guest_results
                }
                let hot = this.hotRef.current!.hotInstance!;
                hot.render()
                CallbackHell.onLoadBestMatch(bestMatch)

            }).catch(err => {
                ToastService.showAxiosError(`Fetching matches`, err)
            });

        axios.get(`/api/schedule/${this.scheduleId}/match/earliest_min`)
            .then(response => {
                const bestMatch: BestMatch = response.data
                if (bestMatch === null) {
                    this.matchEarliestDayName = ''
                    this.matchEarliestGuestResults = []
                } else {
                    this.matchEarliestDayName = bestMatch.day_name
                    this.matchEarliestGuestResults = bestMatch.guest_results
                }
                let hot = this.hotRef.current!.hotInstance!;
                hot.render()
                CallbackHell.onLoadEarliestMatch(bestMatch)

            }).catch(err => {
                ToastService.showAxiosError(`Fetching matches`, err)
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
        let guestEmptyColumns = Array(guestsNum).fill('')
    
        let tableData = [headerRow]
        for (const dayVote of this.dayVotes) {
    
            let guestCells = Array(guestsNum).fill('')
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

    static loadMoreDays() {
        let lastDay = 0
        if (this.dayVotes.length > 0) {
            lastDay = this.dayVotes[this.dayVotes.length - 1].day_timestamp
        }
        
        axios.get(`/api/schedule/${this.scheduleId}/votes/more/${lastDay}`)
            .then(response => {

                let guestsNum = this.guests.length
                let guestEmptyColumns = Array(guestsNum).fill('')
        
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
                
            }).catch(err => {
                ToastService.showAxiosError(`Loading more days`, err)
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

        if (voteChanges.length === 0) {
            ToastService.toastError(`You must select at least one cell`);
            return
        }
    
        for (const [row, col, newValue] of voteChanges) {
            const guest = this.getGuestByColumn(col)
            if (guestId === '') {
                guestId = guest.id
            } else if (guestId !== guest.id) {
                ToastService.toastError(`You can't change answers for multiple guests at once`);
                return
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
        }

        const guest = this.guestsById[guestId]
        let firstAnswer = votes[0].answer
        if (firstAnswer === '') {
            firstAnswer = '(empty)'
        }
    
        axios.post(`/api/guest/${guestId}/votes`, votes)
            .then(response => {

                const voteWord = votes.length > 1 ? 'votes' : 'vote'
                const msg = `${votes.length} ${voteWord} sent by ${guest.name}: ${firstAnswer}`
                ToastService.toastSuccess(msg);
                console.log(msg)
                
            }).catch(err => {
                ToastService.showAxiosError(`Sending votes`, err)
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
                ToastService.toastSuccess(`Added new guest: ${name}`);
                this.refreshAllVotes()

            }).catch(err => {
                ToastService.showAxiosError(`Creating guest`, err)
            });
    }

    static renameGuest(guestIndex: any, newName: string) {
        const guest = this.guests[guestIndex]
        const oldName = guest.name
        axios.put(`/api/guest/${guest.id}`, {name: newName})
            .then(response => {
                guest.name = newName
                console.log(`Guest "${oldName}" renamed to "${newName}"`)
                ToastService.toastSuccess(`Guest "${oldName}" renamed to "${newName}"`);

            }).catch(err => {
                ToastService.showAxiosError(`Renaming guest`, err)
            });
    }

    static deleteGuest(guestIndex: number) {
        const guest = this.guests[guestIndex]
        axios.delete(`/api/guest/${guest.id}`)
            .then(response => {

                this.guests.splice(guestIndex, 1)
                delete this.guestsById[guest.id]
                delete this.guestIdToIndex[guest.id]
                console.log(`Guest "${guest.name}" deleted`)
                ToastService.toastSuccess(`Guest "${guest.name}" has been deleted`);
                this.refreshAllVotes()

            }).catch(err => {
                ToastService.showAxiosError(`Deleting guest`, err)
            });
    }

    static voteOkHours(value: string) {
        this.setSelectedCells(value)
    }

    static setSelectedCells(value: string) {
        let hot = this.hotRef.current!.hotInstance!;
        hot.suspendRender()
        const selected = hot.getSelected() || []
        const minCol = 1
        const maxCol = hot.countCols() - 1
        const minRow = 1
        const maxRow = hot.countRows() - 2

        const changes: Array<[number, number, any]> = []
    
        for (let index = 0; index < selected.length; index += 1) {
            const [row1, column1, row2, column2] = selected[index]
            const startRow = Math.max(Math.min(row1, row2), minRow)
            const endRow = Math.min(Math.max(row1, row2), maxRow)
            const startCol = Math.max(Math.min(column1, column2), minCol)
            const endCol = Math.min(Math.max(column1, column2), maxCol)
    
            for (let rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
                for (let columnIndex = startCol; columnIndex <= endCol; columnIndex += 1) {
                    changes.push([rowIndex, columnIndex, value])
                }
            }
        }

        hot.setDataAtCell(changes)
      
        hot.render()
        hot.resumeRender()
    }

    static updateSchedule(eventName: string, optionsValue: string) {
        this.title = eventName
        this.scheduleOptionsJson = optionsValue
        axios.put(`/api/schedule/${this.scheduleId}`, {
            path_id: this.scheduleId,
            title: this.title,
            options: this.scheduleOptionsJson,
        })
            .then(response => {

                CallbackHell.onTitleLoad(this.title)
                console.log(`Schedule updated`)
                ToastService.toastSuccess(`Schedule updated`);

            }).catch(err => {
                ToastService.showAxiosError(`Updating schedule`, err)
            });
    }

    static deleteSchedule(onSuccess: () => void) {
        axios.delete(`/api/schedule/${this.scheduleId}`)
            .then(response => {

                console.log(`Schedule ${this.scheduleId} deleted`)
                ToastService.toastSuccess(`Schedule has been deleted`);
                onSuccess()

            }).catch(err => {
                ToastService.showAxiosError(`Deleting schedule`, err)
            });
    }

    static createSchedule(eventName: string, optionsValue: string, onSuccessfulCreate: (pathId: string) => void) {
        axios.post(`/api/schedule`, {
            title: eventName,
            options: optionsValue,
        })
            .then(response => {

                console.log(`Schedule ${response.data.id} - ${response.data.path_id} created`)
                ToastService.toastSuccess(`Schedule has been created`);
                onSuccessfulCreate(response.data.path_id)

            }).catch(err => {
                ToastService.showAxiosError(`Creating schedule`, err)
            });
    }

};

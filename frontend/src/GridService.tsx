import { toast } from 'react-toastify';
import axios from "axios";


interface Guest {
    id: string;
    schedule_id: string;
    name: string;
    create_time: number;
    last_update: number;
}


const GridService = {
    title: '...',
    guests: [],
    dayVotes: [],
    scheduleId: '',
    guestsById: {},
    guestIdToIndex: {},

    fetchData(onTitleLoad: (title: string) => void) {
        console.log('loading data');

        axios.get(`/api/schedule/${this.scheduleId}`)
            .then(response => {
                this.title = response.data.title;
                onTitleLoad(this.title);
            }).catch(response => {
                toast(`${response}`, { type: "error" });
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
                toast(`${response}`, { type: "error" });
            });

        axios.get(`/api/schedule/${this.scheduleId}/votes`)
            .then(response => {
                let dayVotes = response.data.day_votes
                this.dayVotes = dayVotes
                this.refreshAllVotes()
            }).catch(response => {
                toast(`${response}`, { type: "error" });
            });
    },

    refreshAllVotes() {

    },
};

export default GridService;

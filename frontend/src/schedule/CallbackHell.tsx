import { BestMatch } from "./ScheduleService"

export class CallbackHell {

    static newGuestViewClickOpen: () => void
    static editScheduleClickOpen: () => void
    static createScheduleClickOpen: () => void
    static onTitleLoad: (title: string) => void
    static onLoadBestMatch: (bestMatch: BestMatch | null) => void
    static onLoadEarliestMatch: (bestMatch: BestMatch | null) => void

}
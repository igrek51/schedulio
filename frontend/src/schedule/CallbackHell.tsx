import { BestMatch } from "./ScheduleService"

export class CallbackHell {

    static newGuestViewClickOpen: () => void = () => {}
    static editScheduleClickOpen: () => void = () => {}
    static createScheduleClickOpen: () => void = () => {}
    static onTitleLoad: (title: string) => void = (title: string) => {}
    static onLoadBestMatch: (bestMatch: BestMatch | null) => void = (bestMatch: BestMatch | null) => {}
    static onLoadSoonestMatch: (bestMatch: BestMatch | null) => void = (bestMatch: BestMatch | null) => {}
    static setSoonestMatchVisible: (val: boolean) => void = (val: boolean) => {}

}
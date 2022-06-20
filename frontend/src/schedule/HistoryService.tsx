export interface ScheduleHistoryItem {
    path_id: string
    title: string
    visit_timestamp: number
}

export interface ScheduleHistory {
    path_id_items: Record<string, ScheduleHistoryItem>;
}

export function isHistoryEmpty(history: ScheduleHistory): boolean {
    return Object.keys(history.path_id_items).length === 0
}

export class HistoryService {

    static readHistory(): ScheduleHistory {
        const historyStr = localStorage.getItem('schedule_history')
        if (historyStr == null) {
            return {
                path_id_items: {}
            }
        }

        let history = JSON.parse(historyStr)
        if (history == null) {
            return {
                path_id_items: {}
            }
        }

        return history
    }

    static saveHistory(history: ScheduleHistory) {
        localStorage.setItem('schedule_history', JSON.stringify(history));
    }

    static saveHistoryItem(path_id: string, title: string) {
        const history = this.readHistory()
        history.path_id_items[path_id] = {
            path_id: path_id,
            title: title,
            visit_timestamp: Date.now(),
        }
        this.saveHistory(history)
    }

    static readOrderedItems(): ScheduleHistoryItem[] {
        const history = this.readHistory()
        const items = Object.values(history.path_id_items)
        items.sort((a, b) => {
            return b.visit_timestamp - a.visit_timestamp
        })
        return items
    }

};

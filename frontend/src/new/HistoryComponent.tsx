import Link from '@mui/material/Link';

import { HistoryService, ScheduleHistoryItem } from "../schedule/HistoryService";


export function HistoryComponent() {

    const historyItems: ScheduleHistoryItem[] = HistoryService.readOrderedItems();

    if (historyItems.length === 0) {
        return (
            <div></div>
        )
    }

    return (
        <div className="mt-4">
            Your recent schedules:
            <ul>
                {historyItems.map(item =>
                <li>
                    <Link href={`/s/${item.path_id}`}>{item.title}</Link>
                </li>
                )}
            </ul>
        </div>
    );
}

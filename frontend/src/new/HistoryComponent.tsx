import React from 'react';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';

import { ToastService } from "../schedule/ToastService";
import { HistoryService, ScheduleHistoryItem } from "../schedule/HistoryService";


export class HistoryComponent extends React.Component {

    constructor(props: any) {
        super(props);
    }

    deleteHistoryItem(path_id: string) {
        HistoryService.deleteHistoryItem(path_id)
        ToastService.toastSuccess('History item deleted')
        this.forceUpdate()
    }

    render() {
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

                        <div className="d-inline-block ml-2">
                            <IconButton onClick={() => {this.deleteHistoryItem(item.path_id)} } title="Delete" aria-label="Delete" size="small">
                                <ClearIcon fontSize="small"/>
                            </IconButton>
                        </div>
                    </li>
                    )}
                </ul>
            </div>
        );
    }
}

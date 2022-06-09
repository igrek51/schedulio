import * as Handsontable from 'handsontable/dist/handsontable.full.min.js';
import { ScheduleService } from './ScheduleService';
import {Tooltip} from 'bootstrap';
import * as $ from 'jquery';


export function cellRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    if (row === 0) {
        td.style.color = '#000000'
        td.style.background = '#F8F9FA'
        td.style.fontWeight = 'bold'
        
        if (col === 0) {
            let tooltip = 'Next days shift automatically each day'
            td.innerHTML = `<div class="py-1" data-toggle="tooltip" data-placement="left" title="${tooltip}">${value}</div>`
        } else {
            let tooltip = 'Double click to rename, right click to delete'
            td.innerHTML = `<div class="py-1" data-toggle="tooltip" data-placement="top" title="${tooltip}">${value}</div>`
        }

    } else if (col === 0) {
        td.style.color = '#000000'
        td.style.background = '#FFFFFF'
        const dayOfWeek = ScheduleService.timestampToDayOfWeek[value]
        if (dayOfWeek !== undefined) {
            if (dayOfWeek === 6) {  // saturday
                td.style.background = '#FAE8DC'
            } else if (dayOfWeek === 0) {  // sunday
                td.style.background = '#FAE8DC'
            }
        }

        let html = value
        let tooltip = ''

        if (row === 1) {
            tooltip = 'Today (next days shift automatically each day)'
        }
        if (row === instance.countRows() - 1) {
            tooltip = 'Click to show more days'
        }

        if (ScheduleService.bestMatchDayName !== '' && ScheduleService.bestMatchDayName === value) {
            html = `<svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium icon-star" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarBorderIcon"><path d="m22 9.24-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"></path></svg> ${html}`
            if (row === 1) {
                tooltip = `Best Match (It's today!)`
            } else {
                tooltip = `Best Match`
            }
        }

        if (tooltip !== '') {
            html = `<div class="py-1" data-toggle="tooltip" data-placement="left" title="${tooltip}">${html}</div>`
            td.title = tooltip
        }
        td.innerHTML = html

    } else if (value === 'ok') {
        td.style.color = '#38782E'
        td.style.background = '#D9EAD3'
        td.style.fontWeight = 'bold'
    } else if (value === 'no') {
        td.style.color = '#AC322C'
        td.style.background = '#EA9999'
    } else if (value === 'maybe') {
        td.style.color = '#71A1D2'
        td.style.background = '#EEF4FB'
    } else if (value === '' || !value) {
        td.style.color = '#000000'
        td.style.background = '#FFFFFF'
    } else {
        td.style.color = '#000000'
        td.style.background = '#FFF2CC'
        td.style.fontWeight = 'bold'
    }
}

export function bestmatchCellRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    td.style.color = '#000000'
    
    let html = value
    let tooltip = ''
    let tooltipPlacement = 'top'
    if (row === instance.countRows() - 1) {
        tooltipPlacement = 'bottom'
    } 
    if (col == 0) {
        tooltipPlacement = 'left'
    }

    if (row === 0) {
        td.style.background = '#F8F9FA'
        td.style.fontWeight = 'bold'
    } else if (row > 0 && col === 0) {
        if (ScheduleService.bestMatchDayName !== '' && ScheduleService.bestMatchDayName === value) {
            html = `<svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium icon-star" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StarBorderIcon"><path d="m22 9.24-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"></path></svg> ${html}`
            tooltip = `Best Match - day with the most confirmed participants`
        }

    } else if (row > 0 && col == 2) {
        tooltip = `Number of confirmed - potential participants of total guests`

    } else if (row > 0 && col > 2) {
        const guestIndex = col - 3
        const guestResult = ScheduleService.guestResults[guestIndex]
        if (guestResult) {
            const guest = ScheduleService.guests[guestIndex]

            if (guestResult === 'ok') {
                td.style.color = '#38782E'
                td.style.background = '#D9EAD3'
                td.style.fontWeight = 'bold'
                if (guest) {
                    tooltip = `${guest.name} confirmed to participate`
                }
            } else if (guestResult === 'no') {
                td.style.color = '#AC322C'
                td.style.background = '#EA9999'
                if (guest) {
                    tooltip = `${guest.name} can't make it`
                }
            } else if (guestResult === 'maybe') {
                td.style.color = '#71A1D2'
                td.style.background = '#EEF4FB'
                if (guest) {
                    tooltip = `${guest.name} maybe will join`
                }
            }
        }
    }

    if (tooltip !== '') {
        html = `<div class="py-1" data-toggle="tooltip" data-placement="${tooltipPlacement}" title="${tooltip}">${html}</div>`
        td.title = tooltip
    }
    td.innerHTML = html
}

export function activateBootstrapTooltips() {
    $('[data-toggle="tooltip"]').tooltip({ boundary: 'window' })
    $('[data-toggle="tooltip"]').tooltip('hide')
    $('.tooltip').hide()
}

import * as Handsontable from 'handsontable/dist/handsontable.full.min.js';
import { GridService } from './GridService';


export function cellRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    if (row === 0) {
        td.style.color = '#000000'
        td.style.background = '#F8F9FA'
        td.style.fontWeight = 'bold'
        // td.innerHTML = '<u>value</u>'
    } else if (col === 0) {
        td.style.color = '#000000'
        td.style.background = '#FFFFFF'
        const dayOfWeek = GridService.timestampToDayOfWeek[value]
        if (dayOfWeek !== undefined) {
            if (dayOfWeek === 6) {  // saturday
                td.style.background = '#FAE8DC'
            } else if (dayOfWeek === 0) {  // sunday
                td.style.background = '#FAE8DC'
            }
        }
    } else if (value === 'ok') {
        td.style.color = '#38782E'
        td.style.background = '#D9EAD3'
        td.style.fontWeight = 'bold'
    } else if (value === 'no') {
        td.style.color = '#AC322C'
        td.style.background = '#EA9999'
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
    if (row === 0) {
        td.style.color = '#000000'
        td.style.background = '#F8F9FA'
        td.style.fontWeight = 'bold'
    } else {
        td.style.color = '#000000'
    }
}

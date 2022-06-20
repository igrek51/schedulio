import * as Handsontable from 'handsontable/dist/handsontable.full.min.js';
// eslint-disable-next-line no-unused-vars
import {Tooltip} from 'bootstrap';  // enable .tooltip jquery function
import * as $ from 'jquery';


export function applyDefaultRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
}

export function activateBootstrapTooltips() {
    $('[data-toggle="tooltip"]').tooltip({ boundary: 'window' })
    $('[data-toggle="tooltip"]').tooltip('hide')
    $('.tooltip').hide()
}

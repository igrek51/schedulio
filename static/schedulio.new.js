const data = [
    ['Mon 23.05', 'ok', '21-24', 'no', ''],
    ['Tue 24.05', 'ok', '21-24', 'no', ''],
    ['Wed 25.05', 'ok', '21-24', 'no', '']
];
  
const container = document.getElementById('scheduleTable');
const hot = new Handsontable(container, {
    data: data,
    colHeaders: ['Day', 'Alice', 'Bob', 'Charlie', 'David'],
    height: 'auto',
    colWidths(index) {
        return 100;
    },
    rowHeights: 40,
    className: 'htCenter htMiddle',
    manualColumnResize: true,
    contextMenu: [
        'ok',
        'ok, but...',
        '(maybe)',
        'no',
    ],
    licenseKey: 'non-commercial-and-evaluation',
});

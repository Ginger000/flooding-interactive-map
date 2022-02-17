d3.csv('../data/flooding.csv', function(err, rows){

function unpack(rows, key) {
  return rows.map(function(row) {
    return row[key];
  });
}

var data = [{
  type: 'parcoords',
  pad: [80,80,80,80],
  line: {
    color: unpack(rows, 'Quartile of claims'),
    colorscale: [[0, 'red'], [0.33, 'green'], [0.66, 'yellow'] [1, 'blue']]
  },

  dimensions: [{
    constraintrange: [3.5, 4],
    range: [1, 4],
    label: 'Quartile of claims',
    values: unpack(rows, 'Quartile of claims')
  }, {
    
    range: [0,24422],
    label: 'Total claims',
    values: unpack(rows, 'Total claims')
  }, {
    label: 'Average payout',
    range: [0, 102618],
    values: unpack(rows, 'Average payout')
  }, {
    label: 'Total households',
    range: [381, 36872],
    values: unpack(rows, 'Total households')
  }, {
    label: 'Percent households of color',
    range: [10, 100],
    values: unpack(rows, 'Percent households of color')
  }, {
    label: 'Median Income',
    range: [20150, 150125],
    values: unpack(rows, 'Median Income')
  }]
}];

var layout = {
  width: 800
};

Plotly.newPlot('pcp', data, layout);

});

/* global d3 */

import React from 'react';
import { connect } from 'react-redux';

import {
  templatize,
  formatCommas,
  formatPrice,
  formatFriendlyPrice,
} from '../util';

const INLINE_STYLES = `/* styles here for download graph compatibility */

* {
  vector-effect: non-scaling-stroke;
}

.stddev-rect {
  position: absolute;;
}

.bars .bar rect {
  fill: #0071bc;
}

.range-fill {
  fill: #eeeeee;
}

.range-rule {
  stroke: #5b616b;
  fill: none;
  stroke-dasharray: 5,5;
  stroke-width: 1;
}

.label-rule {
  stroke: #5b616b;
}

.stddev-text {
  fill: #5b616b;
}

.axis .label {
  fill: #5b616b;
  font-style: italic;
}

.axis line,
.axis path {
  fill: none;
  stroke-width: 1;
  stroke: #000;
  shape-rendering: crispEdges;
}

.axis text {
  font-size: 13px;
}

.stddev-text-label {
  font-size: 12px;
  fill: #5b616b;
}

.avg .value, .pp .value,
.axis .tick.primary text {
  font-weight: bold;
  -webkit-font-smoothing: antialiased;
}

.average, .proposed {
  fill: #fff;
}

rect {
  fill: #999;
  stroke: #fff;
  stroke-width: 1;
  shape-rendering: crispEdges;
}

.avg-label-box, .pp-label-box {
  fill: #212121;
  stroke: none;
}

.avg line, .pp line {
  stroke-width: 1;
  stroke: #212121;
}`;

function updateHistogram(rootEl, data, proposedPrice, showTransition) {
  const width = 720;
  const height = 300;
  const pad = [120, 15, 60, 60];
  const top = pad[0];
  const left = pad[3];
  const right = width - pad[1];
  const bottom = height - pad[2];
  const svg = d3.select(rootEl)
    .attr('viewBox', [0, 0, width, height].join(' '))
    .attr('preserveAspectRatio', 'xMinYMid meet');
  const formatDollars = (n) => `$${formatPrice(n)}`;

  const extent = [data.minimum, data.maximum];
  const bins = data.wage_histogram;
  const x = d3.scale.linear()
      .domain(extent)
      .range([left, right]);
  const countExtent = d3.extent(bins, (d) => d.count);
  const heightScale = d3.scale.linear()
      .domain([0].concat(countExtent))
      .range([0, 1, bottom - top]);

  let stdDevMin = data.average - data.first_standard_deviation;
  let stdDevMax = data.average + data.first_standard_deviation;

  if (isNaN(stdDevMin)) stdDevMin = 0;
  if (isNaN(stdDevMax)) stdDevMax = 0;

  let stdDev = svg.select('.stddev');
  if (stdDev.empty()) {
    stdDev = svg.append('g')
      .attr('transform', 'translate(0,0)')
      .attr('class', 'stddev');
    stdDev.append('rect')
      .attr('class', 'range-fill');
    stdDev.append('line')
      .attr('class', 'range-rule');
    const stdDevLabels = stdDev.append('g')
      .attr('class', 'range-labels')
      .selectAll('g.label')
      .data([
        { type: 'min', anchor: 'end', label: '-1 stddev' },
        { type: 'max', anchor: 'start', label: '+1 stddev' },
      ])
      .enter()
      .append('g')
        .attr('transform', 'translate(0,0)')
        .attr('class', (d) => `label ${d.type}`);
    stdDevLabels.append('line')
      .attr('class', 'label-rule')
      .attr({
        y1: -5,
        y2: 5,
      });
    const stdDevLabelsText = stdDevLabels.append('text')
      .attr('text-anchor', (d) => d.anchor)
      .attr('dx', (d, i) => 8 * (i ? 1 : -1));

    stdDevLabelsText.append('tspan')
      .attr('class', 'stddev-text');
    stdDevLabelsText.append('tspan')
      .attr('class', 'stddev-text-label');
  }

  let xAxis = svg.select('.axis.x');
  if (xAxis.empty()) {
    xAxis = svg.append('g')
      .attr('class', 'axis x');
  }

  let yAxis = svg.select('.axis.y');
  if (yAxis.empty()) {
    yAxis = svg.append('g')
      .attr('class', 'axis y');
  }

  let gBar = svg.select('g.bars');
  if (gBar.empty()) {
    gBar = svg.append('g')
      .attr('class', 'bars');
  }


  // draw proposed price line
  let pp = svg.select('g.pp');
  const ppOffset = -95;
  if (pp.empty()) {
    pp = svg.append('g')
      .attr('class', 'pp');

    pp.append('rect')
      .attr('y', ppOffset - 25)
      .attr('x', -55)
      .attr('class', 'pp-label-box')
      .attr('height', 26)
      .attr('width', 130)
      .attr('rx', 4)
      .attr('ry', 4);

    pp.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', ppOffset - 6)
      .attr('dx', 10)
      .attr('class', 'value proposed');

    pp.append('line');
  }

  const proposedPriceStr = formatFriendlyPrice(proposedPrice);

  // widen proposed price rect if more than a few characters long
  if (proposedPriceStr.length > 3) {
    pp.select('rect').attr('width', 150);
    pp.select('text').attr('dx', 20);
  } else {
    pp.select('rect').attr('width', 130);
    pp.select('text').attr('dx', 10);
  }

  pp.select('line')
    .attr('y1', ppOffset)
    .attr('y2', (bottom - top) + 8);
  pp.select('.value')
    .text(`$${proposedPriceStr} proposed`);

  if (proposedPrice === 0) {
    pp.style('opacity', 0);
  } else {
    pp.style('opacity', 1);
  }

  // draw average line
  let avg = svg.select('g.avg');
  const avgOffset = -55;
  if (avg.empty()) {
    avg = svg.append('g')
      .attr('class', 'avg');

    avg.append('rect')
      .attr('y', avgOffset - 25)
      .attr('x', -55)
      .attr('class', 'avg-label-box')
      .attr('width', 116)
      .attr('height', 26)
      .attr('rx', 4)
      .attr('ry', 4);

    avg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', avgOffset - 7)
      .attr('dx', 3)
      .attr('class', 'value average');

    avg.append('line');
  }

  avg.select('line')
    .attr('y1', avgOffset)
    .attr('y2', (bottom - top) + 8);
  avg.select('.value')
    .text(`${formatDollars(data.average)} average`);

  const bars = gBar.selectAll('.bar')
    .data(bins);

  bars.exit().remove();

  const enter = bars.enter().append('g')
    .attr('class', 'bar');
  enter.append('title');

  const step = (right - left) / bins.length;
  enter.append('rect')
    .attr('x', (d, i) => left + (i * step))
    .attr('y', bottom)
    .attr('width', step)
    .attr('height', 0);

  const title = templatize('{count} results from {min} to {max}');
  bars.select('title')
    .text((d, i) => {
      const inclusive = (i === bins.length - 1);
      const sign = inclusive ? '<=' : '<';
      return title({
        count: formatCommas(d.count),
        min: formatDollars(d.min),
        sign,
        max: formatDollars(d.max),
      });
    });

  const t = showTransition
    ? svg.transition().duration(500)
    : svg;

  const stdDevWidth = x(stdDevMax) - x(stdDevMin);
  const stdDevTop = 85;
  stdDev = t.select('.stddev');
  stdDev
    .attr('transform', `translate(${[x(stdDevMin), stdDevTop]})`);

  stdDev.select('rect.range-fill')
    .attr('width', stdDevWidth)
    .attr('height', bottom - stdDevTop);

  stdDev.select('line.range-rule')
    .attr('x2', stdDevWidth);

  stdDev.select('.label.min .stddev-text')
    .text(formatDollars(stdDevMin))
    .attr({ x: 0, dy: 0 });

  stdDev.select('.label.min .stddev-text-label')
    .text('-1 std dev')
    .attr({ x: -8, dy: '15px' });

  stdDev.select('.label.max')
    .attr('transform', `translate(${[stdDevWidth, 0]})`);

  stdDev.select('.label.max .stddev-text-label')
    .text('+1 std dev')
    .attr({ x: 8, dy: '15px' });


  stdDev.select('.label.max .stddev-text')
    .text(formatDollars(stdDevMax));

  t.select('.avg')
    .attr('transform', `translate(${[~~x(data.average), top]})`);

  t.select('.pp')
    .attr('transform', `translate(${[~~x(proposedPrice), top]})`);

  t.selectAll('.bar')
    .each((d) => {
      d.x = x(d.min); // eslint-disable-line no-param-reassign
      d.width = x(d.max) - d.x; // eslint-disable-line no-param-reassign
      d.height = heightScale(d.count); // eslint-disable-line no-param-reassign
      d.y = bottom - d.height; // eslint-disable-line no-param-reassign
    })
    .select('rect')
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .attr('height', (d) => d.height)
      .attr('width', (d) => d.width);

  const ticks = bins.map((d) => d.min)
    .concat([data.maximum]);

  const xa = d3.svg.axis()
    .orient('bottom')
    .scale(x)
    .tickValues(ticks)
    .tickFormat((d, i) => {
      if (i === 0 || i === bins.length) {
        return formatDollars(d);
      }
      return formatPrice(d);
    });
  xAxis.call(xa)
    .attr('transform', `translate(${[0, bottom + 2]})`)
    .selectAll('.tick')
      .classed('primary', (d, i) => i === 0 || i === bins.length)
      .select('text')
        .classed('min', (d, i) => i === 0)
        .classed('max', (d, i) => i === bins.length)
        .style('text-anchor', 'end')
        .attr('transform', 'rotate(-35)');

  // remove existing labels
  svg.selectAll('text.label').remove();

  xAxis.append('text')
    .attr('class', 'label')
    .attr('transform', `translate(${[left + ((right - left) / 2), 45]})`)
    .attr('text-anchor', 'middle')
    .text('Ceiling price (hourly rate)');

  const yd = d3.extent(heightScale.domain());
  const ya = d3.svg.axis()
    .orient('left')
    .scale(d3.scale.linear()
      .domain(yd)
      .range([bottom, top]))
    .tickValues(yd);
  ya.tickFormat(formatCommas);
  yAxis.call(ya)
    .attr('transform', `translate(${[left - 2, 0]})`);

  yAxis.append('text')
    .attr('class', 'label')
    .attr('transform', `translate(${[-25, (height / 2) + 25]}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('# of results');
}

class Histogram extends React.Component {
  updateHistogram(showTransition) {
    updateHistogram(
      this.svgEl,
      this.props.ratesData,
      this.props.proposedPrice,
      showTransition
    );
  }

  componentDidMount() {
    this.updateHistogram(false);
  }

  componentDidUpdate() {
    this.updateHistogram(true);
  }

  render() {
    return (
      <svg className="graph histogram has-data"
           ref={ (svg) => { this.svgEl = svg; } }>
        <title>Price histogram</title>
        <desc>
          A histogram showing the distribution of labor category prices.
          Each bar represents a range within that distribution.
        </desc>
        <style>{INLINE_STYLES}</style>
      </svg>
    );
  }
}

Histogram.propTypes = {
  ratesData: React.PropTypes.object.isRequired,
  proposedPrice: React.PropTypes.number.isRequired,
};

function mapStateToProps(state) {
  return {
    ratesData: state.rates.data,
    proposedPrice: state['proposed-price'],
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(Histogram);
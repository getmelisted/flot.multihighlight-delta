# jquery.flot.multihighlight-delta
__multihighlight with deltas plugin for jQuery Flot__

For information about Flot library [go here](http://www.flotcharts.org/).

# Dependencies

- jQuery flot

# Usage

Look at the examples/index.html file

## Important notes

This plugin will conflict with the tooltip plugin if `tooltip: true`, so make sure to set it to `tooltip: false` if
using the multihighlightdelta plugin.

# Configuration options

## Mode

Supports either x or y. If x, the plugin will highlight the data points matching the x value being hovered over. If y,
the plugin will highlight the data points matching the y value being hovered over.

## Delta

A function accepting the previous data point (or null if not present) and the current data point as the second argument.

## Tooltip Offsets

You can provide a tooltipOffsetX and tooltipOffsetY which will be added to the pageX and pageY for the tooltip.

## Tooltip Styles

You can provide a tooltipStyles configuration property, in the form of an object that will be passed on to .css()
jQuery method of the tooltip's container. CAREFUL, make sure to have the position absolute properties, otherwise you
simply won't see it, refer to the source code for more details.

## Templates

There are two templates that allow you to customize the look and feel of the tooltip. They use John Resig's micro
templating implementation, found [here](http://ejohn.org/blog/javascript-micro-templating/)

### tooltipTemplate

This template wraps the data points template, it must contain a `<%= body %>` statement, which will output the children
templates, rendered for each matching data point.

### dataPointTemplate

This template is rendered for every matching data point. It receives the following properties :
- series: The flot series in question, allowing access to the label property for example.
- datapoint: The matching flot data point, ususally an array of two values [x,y]
- delta: The delta with the previous value, if any


/**
 *
 * User: Patrick de Lanauze
 * Date: 2013-03-21
 * Time: 10:59 AM
 *
 */

(function (name, definition) {
  var theModule = definition(),
  // this is considered "safe":
      hasDefine = typeof define === 'function' && define.amd,
  // hasDefine = typeof define === 'function',
      hasExports = typeof module !== 'undefined' && module.exports;

  if (hasDefine) { // AMD Module
    define(theModule);
  } else if (hasExports) { // Node.js Module
    module.exports = theModule;
  } else { // Assign to common namespaces or simply the global object (window)
    (this.jQuery || this.ender || this.$ || this)[name] = theModule;
  }
})('core', function () {

  var MultiHighlightDelta = {
    options: {
      multihighlightdelta: {
        mode: 'x',
        tooltipOffsetX: 20,
        tooltipOffsetY: 20,
        tooltipTemplate: '<table class="table"><thead><tr><th></th><th>Value</th><th>Delta</th></tr></thead><tbody><%= body %></tbody></table>',
        dataPointTemplate: '<tr><td><%= series.label %></td><td><%= datapoint[1] %></td><td><%= delta %></td></tr>',
        tooltipStyles: {
          position: 'absolute',
          display: 'none',
          'background': '#fff',
          'z-index': '100',
          'padding': '0.4em 0.6em',
          'border-radius': '0.5em',
          'font-size': '0.8em',
          'border': '1px solid #111'
        },
        delta: function (previousDataPoint, dataPoint) {
          if (!previousDataPoint) {
            return '';
          }
          return dataPoint[1] - previousDataPoint[1];
        }
      }
    }
  };
  var MultiHighlightDeltaPlugin = function (plot) {
    this.plot = plot;
  };

  /**
   * Thanks John Resig! [ http://ejohn.org/blog/javascript-micro-templating/ ]
   * Based heavily off john's implementation , but removed caching
   */
  var compileTemplate = function (str) {

    // Generate a reusable function that will serve as a template
    // generator (and should be cached by its caller).
    /* jshint -W121 */
    return new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

          // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +

          // Convert the template into pure JavaScript
            str.replace(/[\r\t\n]/g, " ")
                .split("<%").join("\t")
                .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                .replace(/\t=(.*?)%>/g, "',$1,'")
                .split("\t").join("');")
                .split("%>").join("p.push('")
                .split("\r").join("\\'") + "');}return p.join('');");
  };

  MultiHighlightDeltaPlugin.prototype = {
    initialize: function () {
      var ctx = this;

      var handlerProxies = {
        onPlotHover: $.proxy(ctx.onPlotHover, ctx),
        onMouseOut: $.proxy(ctx.onMouseOut, ctx)
      };

      this.plot.hooks.bindEvents.push(function (plot) {
        if (!plot.getOptions().multihighlightdelta) {
          return;
        }

        var options = ctx.plot.getOptions().multihighlightdelta || {};
        for (var key in MultiHighlightDelta.options.multihighlightdelta) {
          if (typeof options[key] === 'undefined') {
            options[key] = MultiHighlightDelta.options.multihighlightdelta[key];
          }
        }

        plot.getPlaceholder().on('plothover', handlerProxies.onPlotHover);
        plot.getPlaceholder().on('mouseout', handlerProxies.onMouseOut);

        // Keep a cache of the template
        ctx.tooltipTemplate = compileTemplate(options.tooltipTemplate);
        ctx.dataPointTemplate = compileTemplate(options.dataPointTemplate);

      });
      this.plot.hooks.shutdown.push(function (plot) {
        plot.getPlaceholder().off('plothover', handlerProxies.onPlotHover);
        plot.getPlaceholder().off('mouseout', handlerProxies.onMouseOut);
      });

      return this;
    },
    findOrCreateTooltip: function (tooltipStyles) {
      var $tip = null;
      if ($('#flotTip').length > 0) {
        $tip = $('#flotTip');
      }
      else {
        $tip = $('<div />').attr('id', 'flotTip').css(tooltipStyles).appendTo('body');
      }
      return $tip;
    },
    onPlotHover: function (event, position, item) {
      var data = this.plot.getData();
      var options = this.plot.getOptions().multihighlightdelta;
      var deltaFunction = options.delta;
      var mode = options.mode || 'x';
      var index = 0;
      if (mode === 'x') {
        index = 0;
      } else if (mode === 'y') {
        index = 1;
      } else {
        throw new Error('Mode \'' + mode + '\', is not recognized, must be x or y');
      }

      if (item) {

        this.plot.unhighlight();
        var matchingDataPoints = [];

        for (var i = 0 , ii = data.length; i < ii; i++) {
          // Find the data point in the other series that matches the current datapoint
          var seriesData = data[i].data;
          for (var j = 0 , jj = seriesData.length; j < jj; j++) {
            if (seriesData[j][index] === item.datapoint[index]) {
              matchingDataPoints.push({
                seriesData: data[i],
                dataPoint: seriesData[j],
                delta: deltaFunction(j > 0 ? seriesData[j - 1] : null, seriesData[j])
              });
            }
          }
        }

        var childrenTexts = [];
        for (var i = 0 , ii = matchingDataPoints.length; i < ii; i++) {
          var seriesData = matchingDataPoints[i].seriesData;
          var dataPoint = matchingDataPoints[i].dataPoint;
          var delta = matchingDataPoints[i].delta;
          this.plot.highlight(seriesData, dataPoint);

          var text = this.dataPointTemplate({
            series: seriesData,
            datapoint: dataPoint,
            delta: delta
          });

          childrenTexts.push(text);
        }

        var tooltipText = this.tooltipTemplate({
          body: childrenTexts.join('\n')
        });

        var $tooltip = this.findOrCreateTooltip(options.tooltipStyles);
        $tooltip.html(tooltipText).css({
          left: position.pageX + options.tooltipOffsetX,
          top: position.pageY + options.tooltipOffsetY
        }).show();
      }
    },
    onMouseOut: function () {
      this.plot.unhighlight();
      $('#flotTip').hide();
    }
  };

  MultiHighlightDelta.init = function (plot) {
    new MultiHighlightDeltaPlugin(plot).initialize();
  };

  // Wire up the plugin with flot
  this.jQuery.plot.plugins.push({
    init: MultiHighlightDelta.init,
    options: MultiHighlightDelta.options,
    name: 'multihighlightdelta',
    version: '0.1'
  });

  // Nothing to wire since we're injecting the plugin inside flot
  return {};

});
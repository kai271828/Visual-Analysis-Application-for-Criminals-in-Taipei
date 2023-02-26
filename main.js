var caseCount;
var districtCount;
var periodCount;
var districtMax = 0;
var dpData = {};
var dcData = {};
var cpData = {};
var dpcData = {};
var cpMax = 0;
var dpMax = 0;
var dpcMax = {'自行車竊盜': 73, '住宅竊盜': 63, '汽車竊盜': 13, '機車竊盜': 64, '強盜': 2, '搶奪': 3};
var barchartData = [];
var linechartData = [];
var originalBarY;
var originalLineX;
var originalLineY;
var years = ['All', 104, 105, 106, 107, 108, 109, 110, 111];
var cases = ['All', '自行車竊盜', '住宅竊盜', '汽車竊盜', '機車竊盜', '強盜', '搶奪']
var yearOpt;
const districtRegex = /[\u4e00-\u9fff]{2}區/;
const heatmapDP = d3.select('#heatmapDP');
const heatmapCP = d3.select('#heatmapCP');
const barchart = d3.select('#barchart');
const linechart = d3.select('#linechart');
const map = d3.select('#map');

loadMultipleData(["臺北市自行車竊盜點位資訊-UTF8.csv", "臺北市住宅竊盜點位資訊-UTF8.csv", "臺北市汽車竊盜點位資訊-UTF8.csv", "臺北市機車竊盜點位資訊-UTF8.csv", "臺北市街頭隨機強盜案件點位資訊.csv", "臺北市街頭隨機搶奪案件點位資訊.csv",]).then(data => {
    
    processData(data);

    updateBarChartData();
    updateLineChartData();

    //console.log('districtCount', districtCount);
    //console.log('periodCount', periodCount);
    //console.log('caseCount', caseCount);
    //console.log('cpData', cpData);
    //console.log('dcData', dcData);
    //console.log('dpData', dpData);
    //console.log('dpcData', dpcData);
    //console.log('barchartData' , barchartData);
    //console.log('linechartData', linechartData);
    //console.log('districtMax', districtMax);
    drawHeatMap(1200, 50, 600, 500, heatmapCP, cpData, Object.keys(caseCount), Object.keys(periodCount), cpMax, "案件類型對時段關聯性");
    drawHeatMap(650, 50, 500, 500, heatmapDP, dpData, Object.keys(districtCount), Object.keys(periodCount), dpMax, "地區對時段關聯性");
    drawBarChart(50, 700, 700, 300, barchart, barchartData);
    drawLineChart(800, 700, 700, 300, linechart, linechartData);
    

    d3.json('Taipei.json').then(geojson => {

        const paths = map.append('g').attr('id', 'Taipei');
    
        let projection = d3.geoMercator()
        .fitExtent([[0, 0], [600, 600]], geojson);
    
        let geoGenerator = d3.geoPath()
        .projection(projection);

        let colorScale = d3.scaleSequential(d3.interpolateOrRd)
        .domain([0, districtMax]);
    
        let mouseOver = function(d) {
            paths.selectAll('path')
            .transition()
            .duration(500)
            .style("opacity", .5)
            .style("stroke", "transparent");;

            d3.select(this)
            .transition()
            .duration(500)
            .style("opacity", 1)
            .style("stroke", "black");

            //Update Bar Chart
            updateBarChartData(d.properties.TNAME);

            let barchartY = d3.scaleLinear()
            .domain([0, d3.max(barchartData, d => d.value)])
            .range([ 300, 0]);

            // bars
            barchart.select("#graph").selectAll("rect").data(barchartData)
            .transition().duration(2000)
            .attr("y", function(d) { return barchartY(d.value); })
            .attr("height", function(d) { return 300 - barchartY(d.value); });
            
            // values
            barchart.select("#graph").select("#values").selectAll("text").data(barchartData)
            .transition().duration(2000)
            .attr("y", function(d) { return barchartY(d.value) - 10; })
            .text(d => d.value);
            
            // y axis
            barchart.select("#graph").select("#y-axis")
            .transition().duration(2000)
            .call(d3.axisLeft(barchartY));

            //Update Line Chart
            updateLineChartData(d.properties.TNAME);
            //console.log(linechartData);

            let linechartX = d3.scaleBand()
            .range([ 0, 700])
            .domain(linechartData.map(function(d) { return d.period; }))
            .padding(0.2);

            let linechartY = d3.scaleLinear()
            .domain([0, d3.max(linechartData, d => d.value)])
            .range([ 300, 0]);

            // lines
            linechart.select("#graph").select("#lines").selectAll("path").datum(linechartData)
            .transition().duration(2000)
            .attr("d", d3.line()
                .x(function(d) { return linechartX(d.period)})
                .y(function(d) { return linechartY(d.value)})
            );

            // dots
            linechart.select("#graph").select("#dots").selectAll("circle").data(linechartData)
            .transition().duration(2000)
            .attr("cy", function(d) { return linechartY(d.value) });

            // values
            linechart.select("#graph").select("#values").selectAll("text").data(linechartData)
            .transition().duration(2000)
            .attr("y", function(d) { return linechartY(d.value) - 20; })
            .text(d => d.value);

            // y axis
            linechart.select("#graph").select("#y-axis")
            .transition().duration(2000)
            .call(d3.axisLeft(linechartY));

        }
        
          let mouseLeave = function(d) {
            paths.selectAll('path')
            .transition()
            .duration(500)
            .style("opacity", .8)
            .style("stroke", "transparent");

            d3.select(this)
            .transition()
            .duration(500)
            .style("opacity", .8)
            .style("stroke", "transparent");

            updateBarChartData();

            barchart.select("#graph").selectAll("rect").data(barchartData)
            .transition().duration(2000)
            .attr("y", function(d) { return originalBarY(d.value); })
            .attr("height", function(d) { return 300 - originalBarY(d.value); });

            barchart.select("#graph").select("#values").selectAll("text").data(barchartData)
            .transition().duration(2000)
            .attr("y", function(d) { return originalBarY(d.value) - 10; })
            .text(d => d.value);
            
            barchart.select("#graph").select("#y-axis")
            .transition().duration(2000)
            .call(d3.axisLeft(originalBarY));

            updateLineChartData();
            //console.log(linechartData);

            // lines
            linechart.select("#graph").select("#lines").selectAll("path").datum(linechartData)
            .transition().duration(2000)
            .attr("d", d3.line()
                .x(function(d) { return originalLineX(d.period)})
                .y(function(d) { return originalLineY(d.value)})
            );

            // dots
            linechart.select("#graph").select("#dots").selectAll("circle").data(linechartData)
            .transition().duration(2000)
            .attr("cy", function(d) { return originalLineY(d.value) });

            // values
            linechart.select("#graph").select("#values").selectAll("text").data(linechartData)
            .transition().duration(2000)
            .attr("y", function(d) { return originalLineY(d.value) - 20; })
            .text(d => d.value);

            // y axis
            linechart.select("#graph").select("#y-axis")
            .transition().duration(2000)
            .call(d3.axisLeft(originalLineY));
            
        }

        paths.selectAll('path')
        .data(geojson.features)
        .enter()
        .append('path')
        .attr('stroke', 'transparent')
        .attr('fill', function (d) {
            return colorScale(districtCount[d.properties.TNAME]);
        })
        .attr('d', geoGenerator)
        .style("opacity", 0.8)
        .on("mouseover", mouseOver )
        .on("mouseleave", mouseLeave );


        let texts = map.append('g').attr('id', 'text')
        .selectAll('text')
        .data(geojson.features)
        .enter()
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', '16px')
        .attr('opacity', 0.8)
        .attr("class", "District" )
        .text(function(d) {
          return d.properties.TNAME;
        })
        .attr('transform', function(d) {
          var center = geoGenerator.centroid(d);
          return 'translate (' + center + ')';
        });
    
    });

    d3.select("#selectYearButton").selectAll('option')
    .data(years)
    .enter()
    .append('option')
    .text(function (d) { return d; })
    .attr("value", function (d) { return d; })
    .style("left", "50px").style("top", "100px");

    d3.select("#selectYearButton")
    .on("change", function(d) {
        yearOpt = d3.select(this).property("value");
        processData(data, yearOpt);
        
        d3.json('Taipei.json').then(geojson => {
            let colorScale = d3.scaleSequential(d3.interpolateOrRd)
            .domain([0, districtMax]);

            map.select('#Taipei').selectAll('path').data(geojson.features)
            .transition().duration(2000)
            .attr('fill', function (d) {
                return colorScale(districtCount[d.properties.TNAME]);
            })
        });
        

        let colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, dpMax]);

        heatmapDP.select('#graph').selectAll('rect')
        .transition().duration(2000)
        .attr("value", function(){return dpData[d3.select(this).attr("xLabel")][d3.select(this).attr("yLabel")]})
        .style("fill", function(){
            return colorScale(dpData[d3.select(this).attr("xLabel")][d3.select(this).attr("yLabel")] )
        });

        colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, cpMax]); 

        heatmapCP.select('#graph').selectAll('rect')
        .transition().duration(2000)
        .attr("value", function() {return d3.select(this).attr("xLabel") in cpData ? cpData[d3.select(this).attr("xLabel")][d3.select(this).attr("yLabel")] : 0})
        .style("fill", function(){
            return d3.select(this).attr("xLabel") in cpData ? colorScale(cpData[d3.select(this).attr("xLabel")][d3.select(this).attr("yLabel")] ) : 0;
        });
        
        updateBarChartData();
        originalBarY = d3.scaleLinear()
        .domain([0, d3.max(barchartData, d => d.value)])
        .range([ 300, 0]);

        barchart.select("#graph").selectAll("rect").data(barchartData)
        .transition().duration(2000)
        .attr("y", function(d) { return originalBarY(d.value); })
        .attr("height", function(d) { return 300 - originalBarY(d.value); });

        barchart.select("#graph").select("#values").selectAll("text").data(barchartData)
        .transition().duration(2000)
        .attr("y", function(d) { return originalBarY(d.value) - 10; })
        .text(d => d.value);
            
        barchart.select("#graph").select("#y-axis")
        .transition().duration(2000)
        .call(d3.axisLeft(originalBarY));

        updateLineChartData();
        originalLineY = d3.scaleLinear()
        .domain([0, d3.max(linechartData, d => d.value)])
        .range([ 300, 0 ]);

        // lines
        linechart.select("#graph").select("#lines").selectAll("path").datum(linechartData)
        .transition().duration(2000)
        .attr("d", d3.line()
            .x(function(d) { return originalLineX(d.period)})
            .y(function(d) { return originalLineY(d.value)})
        );

        // dots
        linechart.select("#graph").select("#dots").selectAll("circle").data(linechartData)
        .transition().duration(2000)
        .attr("cy", function(d) { return originalLineY(d.value) });
        
        // values
        linechart.select("#graph").select("#values").selectAll("text").data(linechartData)
        .transition().duration(2000)
        .attr("y", function(d) { return originalLineY(d.value) - 20; })
        .text(d => d.value);

        // y axis
        linechart.select("#graph").select("#y-axis")
        .transition().duration(2000)
        .call(d3.axisLeft(originalLineY));

    });

    d3.select("#selectCaseButton").selectAll('option')
    .data(cases)
    .enter()
    .append('option')
    .text(function (d) { return d; })
    .attr("value", function (d) { return d; });

    d3.select("#selectCaseButton")
    .on("change", function(d) {
        let c = d3.select(this).property("value")
        if(c != 'All'){

            let colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
            .domain([0, dpcMax[c]]);

            heatmapDP.select('#graph').selectAll('rect')
            .transition().duration(2000)
            .attr("value", function(){
                return dpcData[d3.select(this).attr("xLabel")][d3.select(this).attr("yLabel")][c]
            })
            .style("fill", function(){
                return colorScale(dpcData[d3.select(this).attr("xLabel")][d3.select(this).attr("yLabel")][c] )
            });
        }
        else{
            let colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
            .domain([0, dpMax]);

            heatmapDP.select('#graph').selectAll('rect')
            .transition().duration(2000)
            .attr("value", function(){
                return dpData[d3.select(this).attr("xLabel")][d3.select(this).attr("yLabel")]
            })
            .style("fill", function(){
                return colorScale(dpData[d3.select(this).attr("xLabel")][d3.select(this).attr("yLabel")] )
            });
        }
        
    });

});
  

function loadData(file) {
    return d3.csv(file).then(data => {       
        return data;
    });
}
  
async function loadMultipleData(files) {
    return Promise.all(files.map(loadData)).then(dataList => {
        let data = [];
        dataList.forEach(d => data = data.concat(d));
        return data;
    });
}

function drawHeatMap(x, y, width, height, parent, data, xGroup, yGroup, max, name="Title"){
    const graph = parent.append('g').attr('id', 'graph')
    .attr("transform", "translate(" + x + "," + y + ")");

    // Build X scales and axis:
    let scaleX = d3.scaleBand()
    .range([ 0, width])
    .domain(xGroup)
    .padding(0.05);

    graph.append("g").attr('id', 'x-axis')
    .style("font-size", 12)
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(scaleX).tickSize(0))
    .select(".domain").remove();

    // Build Y scales and axis:
    let scaleY = d3.scaleBand()
    .range([height, 0])
    .domain(yGroup)
    .padding(0.05);

    graph.append("g").attr('id', 'y-axis')
    .style("font-size", 12)
    .call(d3.axisLeft(scaleY).tickSize(0))
    .select(".domain").remove();

    // Build color scale
    let colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
    .domain([0, max]);

    
    // Three function that change the tooltip when user hover / move / leave a cell
    let mouseover = function() {
        tooltip
        .style("opacity", 1);

        d3.select(this)
        .style("stroke", "black");
    };

    let mousemove = function() {
        tooltip.selectAll("text")
        .text("案件數量: " + d3.select(this).attr("value"))
        .style("font-size", "12px")
        .attr("x", d3.mouse(this)[0] + 50)
        .attr("y", d3.mouse(this)[1] - 20);
    };
  
    let mouseleave = function() {
        tooltip
        .style("opacity", 0);
        d3.select(this)
        .style("stroke", "none");
    };

    // Add the squares
    for (const xLabel of xGroup){
        for(const yLabel of yGroup){

            graph.append("rect")
            .attr("x", scaleX(xLabel))
            .attr("y", scaleY(yLabel))
            .attr("width", scaleX.bandwidth() )
            .attr("height", scaleY.bandwidth() )
            .attr("value", data[xLabel][yLabel])
            .attr("xLabel",  xLabel)
            .attr("yLabel", yLabel)
            .style("fill", colorScale(data[xLabel][yLabel]) )
            .style("stroke-width", 4)
            .style("stroke", "none")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
        }
        
    }

    // Tooltip
    let tooltip = graph.append("g").attr("id", "tooltip").style("opacity", 0);
    tooltip.append("text");


    // Add title to graph
    graph.append("text")
    .attr("id", "title")
    .attr("x", width / 2)
    .attr("y", height + 50)
    .attr("text-anchor", "middle")
    .style("font-size", "22px")
    .text(name);
}

function drawBarChart(x, y, width, height, parent, data){
    const graph = parent.append('g').attr('id', 'graph')
    .attr("transform", "translate(" + x + "," + y + ")");
    
    // X axis
    let scaleX = d3.scaleBand()
    .range([ 0, width ])
    .domain(data.map(function(d) { return d.case; }))
    .padding(0.2);

    graph.append("g").attr('id', 'x-axis')
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(scaleX))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end")
    .style("font-size", "16px");

    //Y axis
    let scaleY = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([ height, 0]);

    originalBarY = scaleY;

    graph.append("g").attr('id', 'y-axis')
    .call(d3.axisLeft(scaleY));

    graph.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function(d) { return scaleX(d.case); })
    .attr("y", function(d) { return scaleY(d.value); })
    .attr("width", scaleX.bandwidth())
    .attr("height", function(d) { return height - scaleY(d.value); })
    .attr("fill", "#C41E3A");

    graph.append("g").attr('id', 'values')
    .selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .attr("x", function(d) { return scaleX(d.case) + scaleX.bandwidth() / 2; })
    .attr("y", function(d) { return scaleY(d.value) - 10; })
    .attr('text-anchor', 'middle')
    .text(d => d.value);
}

function drawLineChart(x, y, width, height, parent, data)
{
    const graph = parent.append('g').attr('id', 'graph')
    .attr("transform", "translate(" + x + "," + y + ")");

    let scaleX = d3.scaleBand()
    .range([ 0, width ])
    .domain(data.map(function(d) { return d.period; }))
    .padding(0.2);

    // Add X axis
    graph.append("g").attr('id', 'x-axis')
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(scaleX));

    // Add Y axis
    var scaleY = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([ height, 0 ]);

    graph.append("g").attr('id', 'y-axis')
    .call(d3.axisLeft(scaleY));

    originalLineX = scaleX;
    originalLineY = scaleY;

    graph.append("g").attr("id", "lines")
    .append("path")
    .datum(data)
    .attr("d", d3.line()
      .x(function(d) { return scaleX(d.period) })
      .y(function(d) { return scaleY(d.value) })
    )
    .attr("stroke", "black")
    .style("stroke-width", 4)
    .style("fill", "none");

    graph.append("g").attr("id", "dots")
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr("cx", function(d) { return scaleX(d.period) })
    .attr("cy", function(d) { return scaleY(d.value) })
    .attr("r", 7)
    .style("fill", "#C41E3A");

    graph.append("g").attr('id', 'values')
    .selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .attr("x", function(d) { return scaleX(d.period) })
    .attr("y", function(d) { return scaleY(d.value) - 20 })
    .attr('text-anchor', 'middle')
    .text(d => d.value);
}

function updateBarChartData(district='All'){
    barchartData = [];
    if(district == 'All'){
        Object.keys(caseCount).forEach(element => {
            barchartData.push({'case': element, 'value': caseCount[element]});
        });
    }
    else{
        Object.keys(caseCount).forEach(element => {
            barchartData.push({'case': element, 'value': element in dcData[district] ? dcData[district][element] : 0});
        });
    }
}

function updateLineChartData(period='All'){
    linechartData = [];
    if(period == 'All'){
        Object.keys(periodCount).forEach(element => {
            linechartData.push({'period': element, 'value': periodCount[element]});
        });
    }
    else{
        Object.keys(periodCount).forEach(element => {
            linechartData.push({'period': element, 'value': element in dpData[period] ? dpData[period][element] : 0});
        });
    }
}

function processData(data, opt='All'){
    caseCount = {'自行車竊盜': 0, '住宅竊盜': 0, '汽車竊盜': 0, '機車竊盜': 0, '強盜': 0, '搶奪': 0,};
    districtCount = {'中山區': 0, '中正區': 0, '信義區': 0, '內湖區': 0, '北投區': 0, '南港區': 0, '士林區': 0, '大同區': 0, '大安區': 0, '文山區': 0, '松山區': 0, '萬華區': 0,};
    periodCount = {'0~2': 0, '2~4': 0, '4~6': 0, '6~8': 0, '8~10': 0, '10~12': 0, '12~14': 0, '14~16': 0, '16~18': 0, '18~20': 0, '20~22': 0, '22~24': 0,};
    dpData = {};
    dcData = {};
    cpData = {};
    dpcData = {}

    if(opt != 'All'){
        data = data.filter(element => element['發生日期'].substring(0, 3) === opt.toString());
    }

    data.forEach(element => {
        if( districtCount[ element['發生地點'].match(districtRegex)[0] ] == 0 ){
            
            dpData[element['發生地點'].match(districtRegex)[0]] = {'0~2': 0, '2~4': 0, '4~6': 0, '6~8': 0, '8~10': 0, '10~12': 0, '12~14': 0, '14~16': 0, '16~18': 0, '18~20': 0, '20~22': 0, '22~24': 0,};
            
            dpcData[element['發生地點'].match(districtRegex)[0]] = {'0~2': 0, '2~4': 0, '4~6': 0, '6~8': 0, '8~10': 0, '10~12': 0, '12~14': 0, '14~16': 0, '16~18': 0, '18~20': 0, '20~22': 0, '22~24': 0,};
            dpcData[element['發生地點'].match(districtRegex)[0]]['0~2'] = {'自行車竊盜': 0, '住宅竊盜': 0, '汽車竊盜': 0, '機車竊盜': 0, '強盜': 0, '搶奪': 0,};
            dpcData[element['發生地點'].match(districtRegex)[0]]['2~4'] = {'自行車竊盜': 0, '住宅竊盜': 0, '汽車竊盜': 0, '機車竊盜': 0, '強盜': 0, '搶奪': 0,};
            dpcData[element['發生地點'].match(districtRegex)[0]]['4~6'] = {'自行車竊盜': 0, '住宅竊盜': 0, '汽車竊盜': 0, '機車竊盜': 0, '強盜': 0, '搶奪': 0,};
            dpcData[element['發生地點'].match(districtRegex)[0]]['6~8'] = {'自行車竊盜': 0, '住宅竊盜': 0, '汽車竊盜': 0, '機車竊盜': 0, '強盜': 0, '搶奪': 0,};
            dpcData[element['發生地點'].match(districtRegex)[0]]['8~10'] = {'自行車竊盜': 0, '住宅竊盜': 0, '汽車竊盜': 0, '機車竊盜': 0, '強盜': 0, '搶奪': 0,};
            dpcData[element['發生地點'].match(districtRegex)[0]]['10~12'] = {'自行車竊盜': 0, '住宅竊盜': 0, '汽車竊盜': 0, '機車竊盜': 0, '強盜': 0, '搶奪': 0,};
            dpcData[element['發生地點'].match(districtRegex)[0]]['12~14'] = {'自行車竊盜': 0, '住宅竊盜': 0, '汽車竊盜': 0, '機車竊盜': 0, '強盜': 0, '搶奪': 0,};
            dpcData[element['發生地點'].match(districtRegex)[0]]['14~16'] = {'自行車竊盜': 0, '住宅竊盜': 0, '汽車竊盜': 0, '機車竊盜': 0, '強盜': 0, '搶奪': 0,};
            dpcData[element['發生地點'].match(districtRegex)[0]]['16~18'] = {'自行車竊盜': 0, '住宅竊盜': 0, '汽車竊盜': 0, '機車竊盜': 0, '強盜': 0, '搶奪': 0,};
            dpcData[element['發生地點'].match(districtRegex)[0]]['18~20'] = {'自行車竊盜': 0, '住宅竊盜': 0, '汽車竊盜': 0, '機車竊盜': 0, '強盜': 0, '搶奪': 0,};
            dpcData[element['發生地點'].match(districtRegex)[0]]['20~22'] = {'自行車竊盜': 0, '住宅竊盜': 0, '汽車竊盜': 0, '機車竊盜': 0, '強盜': 0, '搶奪': 0,};
            dpcData[element['發生地點'].match(districtRegex)[0]]['22~24'] = {'自行車竊盜': 0, '住宅竊盜': 0, '汽車竊盜': 0, '機車竊盜': 0, '強盜': 0, '搶奪': 0,};
            
            dcData[element['發生地點'].match(districtRegex)[0]] = {};
        }

        districtCount[element['發生地點'].match(districtRegex)[0]]++;
            
        if( caseCount[element['案類']] == 0 ){
            cpData[element['案類']] = {'0~2': 0, '2~4': 0, '4~6': 0, '6~8': 0, '8~10': 0, '10~12': 0, '12~14': 0, '14~16': 0, '16~18': 0, '18~20': 0, '20~22': 0, '22~24': 0,};
        }

        caseCount[element['案類']]++;

        if(element['案類'] in dcData[element['發生地點'].match(districtRegex)[0]]){
            dcData[element['發生地點'].match(districtRegex)[0]][element['案類']] += 1;
        }
        else{
            dcData[element['發生地點'].match(districtRegex)[0]][element['案類']] = 1;
        }

        let period = ( parseInt( element['發生時段'].substring(0, 2) ) + parseInt( element['發生時段'].substring(3, 5) ) ) / 2;
        if(period < 2){
            periodCount['0~2']++;
            dpData[element['發生地點'].match(districtRegex)[0]]['0~2']++;
            dpcData[element['發生地點'].match(districtRegex)[0]]['0~2'][element['案類']]++;
            cpData[element['案類']]['0~2']++;
        }
        else if(period < 4){
            periodCount['2~4']++;
            dpData[element['發生地點'].match(districtRegex)[0]]['2~4']++;
            dpcData[element['發生地點'].match(districtRegex)[0]]['2~4'][element['案類']]++;
            cpData[element['案類']]['2~4']++;
        }
        else if(period < 6){
            periodCount['4~6']++;
            dpData[element['發生地點'].match(districtRegex)[0]]['4~6']++;
            dpcData[element['發生地點'].match(districtRegex)[0]]['4~6'][element['案類']]++;
            cpData[element['案類']]['4~6']++;
        }
        else if(period < 8){
            periodCount['6~8']++;
            dpData[element['發生地點'].match(districtRegex)[0]]['6~8']++;
            dpcData[element['發生地點'].match(districtRegex)[0]]['6~8'][element['案類']]++;
            cpData[element['案類']]['6~8']++;
        }
        else if(period < 10){
            periodCount['8~10']++;
            dpData[element['發生地點'].match(districtRegex)[0]]['8~10']++;
            dpcData[element['發生地點'].match(districtRegex)[0]]['8~10'][element['案類']]++;
            cpData[element['案類']]['8~10']++;
        }
        else if(period < 12){
            periodCount['10~12']++;
            dpData[element['發生地點'].match(districtRegex)[0]]['10~12']++;
            dpcData[element['發生地點'].match(districtRegex)[0]]['10~12'][element['案類']]++;
            cpData[element['案類']]['10~12']++;
        }
        else if(period < 14){
            periodCount['12~14']++;
            dpData[element['發生地點'].match(districtRegex)[0]]['12~14']++;
            dpcData[element['發生地點'].match(districtRegex)[0]]['12~14'][element['案類']]++;
            cpData[element['案類']]['12~14']++;
        }
        else if(period < 16){
            periodCount['14~16']++;
            dpData[element['發生地點'].match(districtRegex)[0]]['14~16']++;
            dpcData[element['發生地點'].match(districtRegex)[0]]['14~16'][element['案類']]++;
            cpData[element['案類']]['14~16']++;
        }
        else if(period < 18){
            periodCount['16~18']++;
            dpData[element['發生地點'].match(districtRegex)[0]]['16~18']++;
            dpcData[element['發生地點'].match(districtRegex)[0]]['16~18'][element['案類']]++;
            cpData[element['案類']]['16~18']++;
        }
        else if(period < 20){
            periodCount['18~20']++;
            dpData[element['發生地點'].match(districtRegex)[0]]['18~20']++;
            dpcData[element['發生地點'].match(districtRegex)[0]]['18~20'][element['案類']]++;
            cpData[element['案類']]['18~20']++;
        }
        else if(period < 22){
            periodCount['20~22']++;
            dpData[element['發生地點'].match(districtRegex)[0]]['20~22']++;
            dpcData[element['發生地點'].match(districtRegex)[0]]['20~22'][element['案類']]++;
            cpData[element['案類']]['20~22']++;
        }
        else{
            periodCount['22~24']++;
            dpData[element['發生地點'].match(districtRegex)[0]]['22~24']++;
            dpcData[element['發生地點'].match(districtRegex)[0]]['22~24'][element['案類']]++;
            cpData[element['案類']]['22~24']++;
        }
        
    });

    districtMax = Math.max(...Object.values(districtCount));
    cpMax = Math.max(...Object.values(cpData).flatMap(Object.values));
    dpMax = Math.max(...Object.values(dpData).flatMap(Object.values));
}
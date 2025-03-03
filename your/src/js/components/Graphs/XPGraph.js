export class XPGraph {
    constructor(containerId, data) {
        // Check if D3 is available
        if (typeof d3 === 'undefined') {
            console.error('D3.js is not loaded! The graph cannot be rendered.');
            this.d3Available = false;
            return;
        } else {
            this.d3Available = true;
            console.log('D3.js is available, version:', d3.version);
        }
        
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID "${containerId}" not found!`);
            return;
        }
        
        this.data = this.processData(data);
        
        // Make the chart responsive
        this.containerWidth = this.container.clientWidth;
        this.width = this.containerWidth || 600;
        this.height = Math.min(400, this.width * 0.7); // Maintain aspect ratio
        this.margin = { top: 30, right: 40, bottom: 50, left: 70 };
        
        // Update colors for dark theme
        this.backgroundColor = '#1a1a1a';
        this.textColor = '#ffffff';
        this.lineColor = '#6366f1'; // Purple for user line
        this.compareLineColor = '#8a8a8a'; // Gray for "All students" line
        this.gridColor = 'rgba(255, 255, 255, 0.1)';
        
        // Add username
        this.username = userData?.login || 'User';
        
        // Gradient ID for area fill
        this.gradientId = 'xpGradient';
    }

    processData(data) {
        try {
            console.log('Processing XP data:', data);
            
            // Check if data is valid
            if (!data || !Array.isArray(data) || data.length === 0) {
                console.warn('No valid XP data provided');
                return [];
            }
            
            // Filter out any invalid data
            const validData = data.filter(d => {
                if (!d || typeof d !== 'object') return false;
                if (d.amount === undefined || d.amount === null) return false;
                if (!d.createdAt) return false;
                return true;
            });
            
            if (validData.length === 0) {
                console.warn('No valid XP transactions found after filtering');
                return [];
            }
            
            console.log(`Found ${validData.length} valid XP transactions`);
                
            // Sort by date and accumulate XP
            return validData
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .reduce((acc, curr) => {
                    try {
                        const lastTotal = acc.length > 0 ? acc[acc.length - 1].total : 0;
                        const amount = Number(curr.amount) || 0;
                        
                        acc.push({
                            date: new Date(curr.createdAt),
                            amount: amount,
                            total: lastTotal + amount,
                            path: curr.path || 'Unknown project'
                        });
                        return acc;
                    } catch (err) {
                        console.error('Error processing XP transaction:', err, curr);
                        return acc;
                    }
                }, []);
        } catch (error) {
            console.error('Error in XP processData:', error);
            return [];
        }
    }

    render() {
        try {
            // Check if D3 is available
            if (!this.d3Available) {
                this.container.innerHTML = `
                    <div class="no-data-message">
                        <p>Cannot render the graph.</p>
                        <p>D3.js library is not loaded. Please check your internet connection and try again.</p>
                    </div>
                `;
                return;
            }
            
            // Clear any previous content
            this.container.innerHTML = '';
            
            // Create a container div for better styling
            const xpGraphContainer = document.createElement('div');
            xpGraphContainer.className = 'xp-graph-container';
            xpGraphContainer.style.width = '100%';
            xpGraphContainer.style.height = '100%';
            xpGraphContainer.style.display = 'flex';
            xpGraphContainer.style.justifyContent = 'center';
            xpGraphContainer.style.alignItems = 'center';
            xpGraphContainer.style.minHeight = '300px';
            xpGraphContainer.style.position = 'relative';
            this.container.appendChild(xpGraphContainer);
            
            if (!this.data || this.data.length === 0) {
                xpGraphContainer.innerHTML = `
                    <div class="no-data-message">
                        <p>No XP data available to display.</p>
                        <p>This could happen if you haven't earned any XP yet or if the data couldn't be retrieved.</p>
                    </div>
                `;
                return;
            }
            
            const svg = this.createSVG(xpGraphContainer);
            this.drawGrid(svg);
            this.drawAxis(svg);
            this.drawLine(svg);
            this.drawPoints(svg);
            this.addAxisLabels(svg);
            this.addTooltip(svg);
        } catch (error) {
            console.error('Error rendering XP graph:', error);
            this.container.innerHTML = `
                <div class="no-data-message">
                    <p>Error rendering XP graph.</p>
                    <p>Please try refreshing the page or contact support if the issue persists.</p>
                </div>
            `;
        }
    }

    createSVG(container) {
        // Create SVG container div with dark background
        const svgContainer = document.createElement('div');
        svgContainer.className = 'xp-svg-container';
        svgContainer.style.display = 'block';
        svgContainer.style.margin = '0 auto';
        svgContainer.style.width = '100%';
        svgContainer.style.height = '100%';
        svgContainer.style.position = 'relative';
        svgContainer.style.overflow = 'visible';
        svgContainer.style.backgroundColor = this.backgroundColor;
        svgContainer.style.padding = '20px';
        svgContainer.style.borderRadius = '8px';
        container.appendChild(svgContainer);
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = 'XP progression';
        title.style.color = this.textColor;
        title.style.marginBottom = '20px';
        title.style.fontWeight = '400';
        svgContainer.appendChild(title);
        
        // Add legend
        const legend = document.createElement('div');
        legend.style.display = 'flex';
        legend.style.alignItems = 'center';
        legend.style.marginBottom = '20px';
        
        // User legend item
        const userLegend = document.createElement('div');
        userLegend.style.display = 'flex';
        userLegend.style.alignItems = 'center';
        userLegend.style.marginRight = '20px';
        
        const userColor = document.createElement('span');
        userColor.style.display = 'inline-block';
        userColor.style.width = '20px';
        userColor.style.height = '2px';
        userColor.style.backgroundColor = this.lineColor;
        userColor.style.marginRight = '8px';
        
        const userName = document.createElement('span');
        userName.textContent = this.username;
        userName.style.color = this.lineColor;
        
        userLegend.appendChild(userColor);
        userLegend.appendChild(userName);
        
        // All students legend item
        const allLegend = document.createElement('div');
        allLegend.style.display = 'flex';
        allLegend.style.alignItems = 'center';
        
        const allColor = document.createElement('span');
        allColor.style.display = 'inline-block';
        allColor.style.width = '20px';
        allColor.style.height = '2px';
        allColor.style.backgroundColor = this.compareLineColor;
        allColor.style.marginRight = '8px';
        
        const allName = document.createElement('span');
        allName.textContent = 'All students';
        allName.style.color = '#ffffff';
        
        allLegend.appendChild(allColor);
        allLegend.appendChild(allName);
        
        legend.appendChild(userLegend);
        legend.appendChild(allLegend);
        svgContainer.appendChild(legend);
        
        // Add total XP display
        const total = document.createElement('div');
        total.style.position = 'absolute';
        total.style.top = '30px';
        total.style.right = '30px';
        total.style.textAlign = 'right';
        
        const totalLabel = document.createElement('div');
        totalLabel.textContent = 'Total';
        totalLabel.style.color = '#8a8a8a';
        
        const totalValue = document.createElement('div');
        const lastDataPoint = this.data[this.data.length - 1];
        totalValue.textContent = `${Math.floor((lastDataPoint?.total || 0) / 1000)} kB`;
        totalValue.style.color = this.textColor;
        totalValue.style.fontSize = '18px';
        
        total.appendChild(totalLabel);
        total.appendChild(totalValue);
        svgContainer.appendChild(total);
        
        // Create SVG with dark theme colors
        const svg = d3.select(svgContainer)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .style('overflow', 'visible');
            
        return svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
            .attr('class', 'xp-chart');
    }

    drawGrid(svg) {
        const xScale = this.getXScale()
        const yScale = this.getYScale()
        
        // Add horizontal grid lines
        svg.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(yScale)
                .tickSize(-(this.width - this.margin.left - this.margin.right))
                .tickFormat('')
            )
            .attr('stroke', this.gridColor)
            .attr('stroke-opacity', 0.7)
            .selectAll('line')
            .attr('stroke-dasharray', '3,3')
            
        // Remove the domain line
        svg.selectAll('.grid .domain').remove()
    }

    drawAxis(svg) {
        const xScale = this.getXScale();
        const yScale = this.getYScale();

        // X-axis with light colors for dark theme
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${this.height - this.margin.top - this.margin.bottom})`)
            .call(d3.axisBottom(xScale)
                .ticks(5)
                .tickSize(0)
                .tickFormat(d => {
                    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                })
            )
            .style('color', 'rgba(255, 255, 255, 0.6)')
            .selectAll('text')
            .style('font-size', '12px')
            .style('fill', 'rgba(255, 255, 255, 0.6)');

        // Remove domain lines
        svg.selectAll('.x-axis path.domain, .y-axis path.domain').remove();
        svg.selectAll('.x-axis line').remove();
        
        // Y-axis with KB values
        svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale)
                .tickSize(0)
                .tickFormat(d => {
                    return Math.floor(d/1000) + 'K';
                })
            )
            .style('color', 'rgba(255, 255, 255, 0.6)')
            .selectAll('text')
            .style('font-size', '12px')
            .style('fill', 'rgba(255, 255, 255, 0.6)');
            
        svg.selectAll('.y-axis line').remove();
    }

    drawLine(svg) {
        const xScale = this.getXScale();
        const yScale = this.getYScale();

        // Create a line generator
        const line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.total))
            .curve(d3.curveCatmullRom.alpha(0.5)); // Smoother curve

        // Add the line path with animation
        const path = svg.append('path')
            .datum(this.data)
            .attr('class', 'xp-line')
            .attr('fill', 'none')
            .attr('stroke', this.lineColor)
            .attr('stroke-width', 3)
            .attr('d', line)
            .style('filter', 'drop-shadow(0px 2px 3px rgba(98, 83, 181, 0.3))');
            
        // Add area below the line with gradient fill
        const area = d3.area()
            .x(d => xScale(d.date))
            .y0(this.height - this.margin.top - this.margin.bottom)
            .y1(d => yScale(d.total))
            .curve(d3.curveCatmullRom.alpha(0.5)); // Smoother curve
            
        const areaPath = svg.append('path')
            .datum(this.data)
            .attr('class', 'xp-area')
            .attr('fill', `url(#${this.gradientId})`)
            .attr('d', area)
            .style('opacity', 0);
            
        // Animate the area
        areaPath.transition()
            .duration(1000)
            .delay(500)
            .style('opacity', 1);
            
        // Animate the line drawing
        const pathLength = path.node().getTotalLength();
        
        path.attr('stroke-dasharray', pathLength + ' ' + pathLength)
            .attr('stroke-dashoffset', pathLength)
            .transition()
            .duration(1500)
            .ease(d3.easePolyOut.exponent(2.5))
            .attr('stroke-dashoffset', 0);
    }
    
    drawPoints(svg) {
        const xScale = this.getXScale();
        const yScale = this.getYScale();
        
        // Only draw points if we don't have too many
        if (this.data.length <= 50) {
            const points = svg.selectAll('.xp-point')
                .data(this.data)
                .enter()
                .append('circle')
                .attr('class', 'xp-point')
                .attr('cx', d => xScale(d.date))
                .attr('cy', d => yScale(d.total))
                .attr('r', 0) // Start with radius 0 for animation
                .attr('fill', this.lineColor)
                .attr('stroke', this.backgroundColor)
                .attr('stroke-width', 1.5)
                .style('filter', 'drop-shadow(0px 1px 2px rgba(98, 83, 181, 0.3))');
                
            // Animate points appearing after the line animation
            points.transition()
                .duration(500)
                .delay((d, i) => 1500 + i * (500 / this.data.length))
                .attr('r', 5)
                .ease(d3.easeBounce);
        }
    }
    
    addAxisLabels(svg) {
        // X-axis label
        svg.append('text')
            .attr('class', 'x-axis-label')
            .attr('x', (this.width - this.margin.left - this.margin.right) / 2)
            .attr('y', this.height - this.margin.top - this.margin.bottom + 40)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', '500')
            .style('fill', '#4a5568')
            .style('opacity', 0)
            .text('Date')
            .transition()
            .duration(800)
            .delay(1800)
            .style('opacity', 1);
            
        // Y-axis label
        svg.append('text')
            .attr('class', 'y-axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -(this.height - this.margin.top - this.margin.bottom) / 2)
            .attr('y', -45)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', '500')
            .style('fill', '#4a5568')
            .style('opacity', 0)
            .text('Total XP (kB)')
            .transition()
            .duration(800)
            .delay(1800)
            .style('opacity', 1);
    }

    addTooltip(svg) {
        const xScale = this.getXScale();
        const yScale = this.getYScale();
        
        svg.selectAll('.xp-point')
            .data(this.data)
            .enter()
            .append('circle')
            .attr('class', 'xp-point')
            .attr('cx', d => xScale(d.date))
            .attr('cy', d => yScale(d.total))
            .attr('r', 4)
            .attr('fill', this.lineColor)
            .attr('stroke', this.backgroundColor)
            .attr('stroke-width', 1)
            .on('mouseover', function(event, d) {
                // Add tooltip directly next to point
                const date = d.date.toLocaleDateString(undefined, {
                    month: 'short', 
                    day: 'numeric'
                });
                const kbValue = Math.floor(d.total / 1000);
                
                d3.select(this.parentNode)
                    .append('text')
                    .attr('class', 'tooltip-text')
                    .attr('x', xScale(d.date) + 10)
                    .attr('y', yScale(d.total) - 10)
                    .style('fill', '#ffffff')
                    .style('font-size', '12px')
                    .text(`${date}: ${kbValue} kB`);
            })
            .on('mouseout', function() {
                d3.select(this.parentNode).selectAll('.tooltip-text').remove();
            });
    }
    
    // Utility methods for scales
    getXScale() {
        return d3.scaleTime()
            .domain(d3.extent(this.data, d => d.date))
            .range([0, this.width - this.margin.left - this.margin.right])
    }
    
    getYScale() {
        return d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d.total) * 1.1]) // Add 10% padding on top
            .range([this.height - this.margin.top - this.margin.bottom, 0])
    }

    formatAxisNumber(num) {
        if (num >= 1000000) {
            return (num / 1000).toFixed(0) + 'K';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K';
        }
        return num;
    }
} 
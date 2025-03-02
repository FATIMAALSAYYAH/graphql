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
        
        // Make the chart responsive with better mobile handling
        this.containerWidth = this.container.clientWidth;
        this.width = this.containerWidth || 600;
        
        // Adjust height for mobile - use a more compact height on small screens
        const isMobile = this.containerWidth < 480;
        this.height = isMobile ? Math.min(280, this.width * 0.6) : Math.min(400, this.width * 0.7);
        
        // Adjust margins for mobile - use smaller margins on small screens
        this.margin = { 
            top: 20, 
            right: isMobile ? 20 : 40, 
            bottom: isMobile ? 40 : 50, 
            left: isMobile ? 40 : 70 
        };
        
        // Improved color scheme to match with our purple theme
        this.lineColor = '#6253b5'; // Primary dark color
        this.areaColor = 'rgba(138, 123, 217, 0.2)'; // Light purple with transparency
        this.pointColor = '#8a7bd9'; // Primary color
        this.gridColor = 'rgba(226, 232, 240, 0.5)'; // Light gray with transparency
        
        // Gradient ID for area fill
        this.gradientId = 'xpGradient';
        
        // Flag to use simplified layout on mobile
        this.isMobile = isMobile;
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
        // Create SVG container div
        const svgContainer = document.createElement('div');
        svgContainer.className = 'xp-svg-container';
        svgContainer.style.display = 'block';
        svgContainer.style.margin = '0 auto';
        svgContainer.style.width = '100%';
        svgContainer.style.height = '100%';
        svgContainer.style.position = 'relative';
        svgContainer.style.overflow = 'visible';
        container.appendChild(svgContainer);
        
        // Create SVG element
        const svg = d3.select(svgContainer)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .style('overflow', 'visible')
            .style('animation', 'fadeIn 0.8s ease-in-out');
            
        // Add gradient definition
        const defs = svg.append('defs');
        
        // Gradient for area below the line
        const gradient = defs.append('linearGradient')
            .attr('id', this.gradientId)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');
            
        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', 'rgba(138, 123, 217, 0.4)')
            .attr('stop-opacity', 1);
            
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', 'rgba(138, 123, 217, 0.05)')
            .attr('stop-opacity', 1);
            
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

        // X-axis with formatted dates - adjust tick count for mobile
        const tickCount = this.isMobile ? 3 : Math.min(this.data.length, 5);
        
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${this.height - this.margin.top - this.margin.bottom})`)
            .call(d3.axisBottom(xScale)
                .ticks(tickCount)
                .tickFormat(d => {
                    // Simplified date format for mobile
                    if (this.isMobile) {
                        return d.toLocaleDateString(undefined, { month: 'short' });
                    }
                    // Full format for desktop
                    return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
                })
            )
            .style('color', '#718096')
            .style('font-size', this.isMobile ? '9px' : '11px');

        // Y-axis with formatted numbers
        svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale)
                .ticks(this.isMobile ? 3 : 5)
                .tickFormat(d => {
                    // Simplified number format for mobile
                    if (d >= 1000) {
                        return (d / 1000) + 'k';
                    }
                    return d;
                })
            )
            .style('color', '#718096')
            .style('font-size', this.isMobile ? '9px' : '11px');
            
        // Style axis lines
        svg.selectAll('.x-axis line, .y-axis line')
            .style('stroke', 'rgba(226, 232, 240, 0.8)');
            
        svg.selectAll('.x-axis path.domain, .y-axis path.domain')
            .style('stroke', 'rgba(226, 232, 240, 0.8)');
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
                .attr('fill', this.pointColor)
                .attr('stroke', 'white')
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
        // Skip axis labels on very small screens
        if (this.containerWidth < 350) {
            return;
        }
        
        // X-axis label - simplified for mobile
        svg.append('text')
            .attr('class', 'x-axis-label')
            .attr('x', (this.width - this.margin.left - this.margin.right) / 2)
            .attr('y', this.height - this.margin.top - this.margin.bottom + (this.isMobile ? 30 : 40))
            .attr('text-anchor', 'middle')
            .style('font-size', this.isMobile ? '10px' : '14px')
            .style('font-weight', '500')
            .style('fill', '#4a5568')
            .style('opacity', 0)
            .text(this.isMobile ? 'Date' : 'Date')
            .transition()
            .duration(800)
            .delay(1800)
            .style('opacity', 1);
            
        // Y-axis label - simplified for mobile
        svg.append('text')
            .attr('class', 'y-axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -(this.height - this.margin.top - this.margin.bottom) / 2)
            .attr('y', this.isMobile ? -30 : -45)
            .attr('text-anchor', 'middle')
            .style('font-size', this.isMobile ? '10px' : '14px')
            .style('font-weight', '500')
            .style('fill', '#4a5568')
            .style('opacity', 0)
            .text(this.isMobile ? 'XP' : 'Total XP')
            .transition()
            .duration(800)
            .delay(1800)
            .style('opacity', 1);
    }

    addTooltip(svg) {
        const xScale = this.getXScale()
        const yScale = this.getYScale()
        
        // Create tooltip div
        const tooltip = d3.select(this.container)
            .append('div')
            .attr('class', 'graph-tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background-color', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', this.isMobile ? '5px 8px' : '8px')
            .style('border-radius', '4px')
            .style('pointer-events', 'none')
            .style('z-index', 100)
            .style('font-size', this.isMobile ? '10px' : '12px')
            .style('max-width', this.isMobile ? '150px' : '200px');
            
        // Add a vertical line for hover position
        const hoverLine = svg.append('line')
            .attr('class', 'hover-line')
            .attr('y1', 0)
            .attr('y2', this.height - this.margin.top - this.margin.bottom)
            .style('stroke', '#2c3e50')
            .style('stroke-width', 1)
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0)
            
        // Create a transparent overlay to handle mouse events
        svg.append('rect')
            .attr('class', 'overlay')
            .attr('width', this.width - this.margin.left - this.margin.right)
            .attr('height', this.height - this.margin.top - this.margin.bottom)
            .style('fill', 'none')
            .style('pointer-events', 'all')
            .on('mouseover', () => {
                tooltip.style('opacity', 0.9)
                hoverLine.style('opacity', 1)
            })
            .on('mouseout', () => {
                tooltip.style('opacity', 0)
                hoverLine.style('opacity', 0)
            })
            .on('mousemove', (event) => {
                // Get mouse position relative to the SVG
                const [mouseX, mouseY] = d3.pointer(event)
                
                // Find the closest data point to the mouse position
                const x0 = xScale.invert(mouseX)
                const bisect = d3.bisector(d => d.date).left
                const index = bisect(this.data, x0, 1)
                
                if (index >= this.data.length) return
                
                const d0 = this.data[index - 1]
                const d1 = this.data[index]
                
                if (!d0 || !d1) return
                
                // Choose the closest point
                const d = x0 - d0.date > d1.date - x0 ? d1 : d0
                
                // Position the hover line
                hoverLine
                    .attr('x1', xScale(d.date))
                    .attr('x2', xScale(d.date))
                
                // Format the date
                const formattedDate = d.date.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })
                
                // Update tooltip content
                tooltip.html(`
                    <div><strong>Date:</strong> ${formattedDate}</div>
                    <div><strong>Project:</strong> ${d.path || 'N/A'}</div>
                    <div><strong>XP Earned:</strong> ${d.amount.toLocaleString()}</div>
                    <div><strong>Total XP:</strong> ${d.total.toLocaleString()}</div>
                `)
                
                // Position the tooltip
                const containerRect = this.container.getBoundingClientRect()
                const svgRect = d3.select(this.container).select('svg').node().getBoundingClientRect()
                const tooltipHeight = tooltip.node().getBoundingClientRect().height
                
                const left = svgRect.left - containerRect.left + xScale(d.date) + this.margin.left + 10
                const top = svgRect.top - containerRect.top + yScale(d.total) + this.margin.top - tooltipHeight / 2
                
                tooltip
                    .style('left', `${left}px`)
                    .style('top', `${top}px`)
            })
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
} 
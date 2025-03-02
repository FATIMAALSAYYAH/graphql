export class AuditBarGraph {
    constructor(containerId) {
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
        
        // Get the audit data from the user data
        this.auditData = this.getAuditData();
        
        // Make chart responsive with better mobile handling
        this.containerWidth = this.container.clientWidth;
        
        // Flag for mobile layout
        this.isMobile = this.containerWidth < 480;
        
        this.width = this.containerWidth || 600;
        // Adjust height for better aspect ratio on mobile
        this.height = this.isMobile ? 220 : Math.min(300, this.width * 0.6);
        
        // Adjust margins for mobile
        this.margin = { 
            top: 20, 
            right: this.isMobile ? 20 : 30, 
            bottom: this.isMobile ? 40 : 50, 
            left: this.isMobile ? 40 : 60 
        };
        
        // Color scheme - using our theme colors
        this.colors = {
            'Up': '#6253b5',    // Primary dark for audits done
            'Down': '#8a7bd9'   // Primary color for audits received
        };
        
        // Gradient IDs
        this.gradientIds = {
            'Up': 'auditUpGradient',
            'Down': 'auditDownGradient'
        };
    }
    
    getAuditData() {
        try {
            // Try to get the audit data from the global userData object
            if (window.userData) {
                const totalUp = window.userData.totalUp || 0;
                const totalDown = window.userData.totalDown || 0;
                
                return [
                    { label: 'Up', value: totalUp, description: 'Audits Done' },
                    { label: 'Down', value: totalDown, description: 'Audits Received' }
                ];
            }
            
            // Default values if we can't find the data
            return [
                { label: 'Up', value: 4452525, description: 'Audits Done' },
                { label: 'Down', value: 5176617, description: 'Audits Received' }
            ];
        } catch (error) {
            console.error('Error getting audit data:', error);
            return [
                { label: 'Up', value: 0, description: 'Audits Done' },
                { label: 'Down', value: 0, description: 'Audits Received' }
            ];
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
            const auditGraphContainer = document.createElement('div');
            auditGraphContainer.className = 'audit-graph-container';
            auditGraphContainer.style.width = '100%';
            auditGraphContainer.style.height = '100%';
            auditGraphContainer.style.display = 'flex';
            auditGraphContainer.style.justifyContent = 'center';
            auditGraphContainer.style.alignItems = 'center';
            auditGraphContainer.style.minHeight = '300px';
            auditGraphContainer.style.position = 'relative';
            this.container.appendChild(auditGraphContainer);
            
            // If no data, show no data message
            if (!this.auditData || this.auditData.length === 0) {
                auditGraphContainer.innerHTML = `
                    <div class="no-data-message">
                        <p>No audit data available to display.</p>
                    </div>
                `;
                return;
            }
            
            this.createBarChart(auditGraphContainer);
            
        } catch (error) {
            console.error('Error rendering audit bar graph:', error);
            this.container.innerHTML = `
                <div class="no-data-message">
                    <p>Error rendering audit bar graph.</p>
                    <p>Please try refreshing the page or contact support if the issue persists.</p>
                </div>
            `;
        }
    }
    
    createBarChart(container) {
        // Create SVG container div
        const svgContainer = document.createElement('div');
        svgContainer.className = 'audit-svg-container';
        svgContainer.style.display = 'block';
        svgContainer.style.margin = '0 auto';
        svgContainer.style.width = '100%';
        svgContainer.style.height = '100%';
        svgContainer.style.position = 'relative';
        svgContainer.style.overflow = 'visible';
        container.appendChild(svgContainer);
        
        // Create SVG
        const svg = d3.select(svgContainer)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .attr('class', 'audit-chart')
            .style('overflow', 'visible')
            .style('animation', 'fadeIn 0.8s ease-in-out');
        
        // Add gradient definitions
        const defs = svg.append('defs');
        
        // Gradient for Up bars
        const gradientUp = defs.append('linearGradient')
            .attr('id', this.gradientIds.Up)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');
            
        gradientUp.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#6253b5')
            .attr('stop-opacity', 1);
            
        gradientUp.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#8a7bd9')
            .attr('stop-opacity', 0.8);
            
        // Gradient for Down bars
        const gradientDown = defs.append('linearGradient')
            .attr('id', this.gradientIds.Down)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');
            
        gradientDown.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#8a7bd9')
            .attr('stop-opacity', 1);
            
        gradientDown.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#b5a8f0')
            .attr('stop-opacity', 0.8);
        
        // Calculate inner dimensions
        const innerWidth = this.width - this.margin.left - this.margin.right;
        const innerHeight = this.height - this.margin.top - this.margin.bottom;
        
        // Create a group for the chart content
        const g = svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        
        // Create scales
        const xScale = d3.scaleBand()
            .domain(this.auditData.map(d => d.label))
            .range([0, innerWidth])
            .padding(this.isMobile ? 0.3 : 0.4); // Narrower bars on mobile
        
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(this.auditData, d => d.value) * 1.1]) // Add 10% padding at the top
            .range([innerHeight, 0]);
        
        // Add grid lines - fewer on mobile
        g.append('g')
            .attr('class', 'grid-lines')
            .call(d3.axisLeft(yScale)
                .tickSize(-innerWidth)
                .tickFormat('')
                .ticks(this.isMobile ? 3 : 5))
            .style('stroke', 'rgba(226, 232, 240, 0.5)')
            .style('stroke-dasharray', '3,3')
            .selectAll('line')
            .style('stroke', 'rgba(226, 232, 240, 0.5)');
            
        g.selectAll('.domain').style('stroke', 'none');
            
        // Create and add the bars
        g.selectAll('.bar')
            .data(this.auditData)
            .enter()
            .append('rect')
            .attr('class', 'audit-bar')
            .attr('x', d => xScale(d.label))
            .attr('y', innerHeight) // Start at bottom for animation
            .attr('width', xScale.bandwidth())
            .attr('height', 0) // Start with height 0 for animation
            .attr('fill', d => `url(#${this.gradientIds[d.label]})`)
            .attr('rx', 8) // Rounded corners
            .style('filter', 'drop-shadow(0px 4px 8px rgba(0,0,0,0.15))')
            .transition() // Add animation
            .duration(1000)
            .ease(d3.easeCubicOut)
            .attr('y', d => yScale(d.value))
            .attr('height', d => innerHeight - yScale(d.value));
            
        // Add bar hover effect
        g.selectAll('.bar-hover')
            .data(this.auditData)
            .enter()
            .append('rect')
            .attr('class', 'bar-hover')
            .attr('x', d => xScale(d.label))
            .attr('y', 0)
            .attr('width', xScale.bandwidth())
            .attr('height', innerHeight)
            .attr('fill', 'transparent')
            .style('cursor', 'pointer')
            .on('mouseover', (event, d) => {
                // Highlight bar
                g.selectAll('.audit-bar')
                    .filter(bar => bar.label === d.label)
                    .transition()
                    .duration(200)
                    .attr('filter', 'brightness(1.1)');
                    
                // Show tooltip
                const tooltip = g.append('g')
                    .attr('class', 'tooltip')
                    .attr('transform', `translate(${xScale(d.label) + xScale.bandwidth() / 2}, ${yScale(d.value) - 15})`);
                    
                const tooltipRect = tooltip.append('rect')
                    .attr('x', -60)
                    .attr('y', -40)
                    .attr('width', 120)
                    .attr('height', 35)
                    .attr('rx', 4)
                    .attr('fill', 'rgba(45, 55, 72, 0.9)')
                    .style('filter', 'drop-shadow(0px 2px 3px rgba(0,0,0,0.1))');
                    
                tooltip.append('text')
                    .attr('x', 0)
                    .attr('y', -18)
                    .attr('text-anchor', 'middle')
                    .attr('fill', 'white')
                    .style('font-size', '12px')
                    .style('font-weight', '600')
                    .text(this.formatTooltipNumber(d.value));
            })
            .on('mouseout', (event, d) => {
                // Remove highlight
                g.selectAll('.audit-bar')
                    .filter(bar => bar.label === d.label)
                    .transition()
                    .duration(200)
                    .attr('filter', null);
                    
                // Remove tooltip
                g.selectAll('.tooltip').remove();
            });
        
        // Add value labels on top of bars - smaller font on mobile
        g.selectAll('.value-label')
            .data(this.auditData)
            .enter()
            .append('text')
            .attr('class', 'value-label')
            .attr('x', d => xScale(d.label) + xScale.bandwidth() / 2)
            .attr('y', d => yScale(d.value) - (this.isMobile ? 5 : 10))
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .style('font-size', this.isMobile ? '10px' : '14px')
            .style('font-weight', '600')
            .style('fill', '#2d3748')
            .style('opacity', 0) // Start invisible for animation
            .text(d => this.formatMobileNumber(d.value))
            .transition() // Add animation
            .duration(1000)
            .delay(600)
            .style('opacity', 1);
        
        // Add description labels below bars - smaller font on mobile
        g.selectAll('.description-label')
            .data(this.auditData)
            .enter()
            .append('text')
            .attr('class', 'description-label')
            .attr('x', d => xScale(d.label) + xScale.bandwidth() / 2)
            .attr('y', innerHeight + (this.isMobile ? 20 : 25))
            .attr('text-anchor', 'middle')
            .style('font-size', this.isMobile ? '11px' : '14px')
            .style('font-weight', '500')
            .style('fill', '#2d3748')
            .style('opacity', 0) // Start invisible for animation
            .text(d => this.isMobile ? d.label : d.description)
            .transition() // Add animation
            .duration(800)
            .delay((d, i) => 400 + i * 200)
            .style('opacity', 1);
        
        // Add Y axis
        g.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale)
                .ticks(5)
                .tickFormat(this.formatAxisNumber))
            .style('animation', 'fadeIn 1s ease-in-out')
            .selectAll('text')
            .style('font-size', '12px')
            .style('fill', '#718096');
            
        // Style axis lines
        g.selectAll('.y-axis line')
            .style('stroke', 'rgba(226, 232, 240, 0.8)')
            .style('stroke-dasharray', '1,1');
            
        g.selectAll('.y-axis path.domain')
            .style('stroke', 'rgba(226, 232, 240, 0.8)');
        
        // Add Y axis label
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -45)
            .attr('x', -innerHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .style('font-size', '14px')
            .style('font-weight', '500')
            .style('fill', '#4a5568')
            .style('opacity', 0) // Start invisible for animation
            .text('Audit Points (MB)')
            .transition() // Add animation
            .duration(800)
            .delay(1000)
            .style('opacity', 1);
    }
    
    formatTooltipNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + ' MB';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + ' KB';
        }
        return num.toString();
    }
    
    formatAxisNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K';
        }
        return num;
    }
    
    // Add a special formatter for mobile
    formatMobileNumber(num) {
        if (this.isMobile) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(0) + 'K';
            }
            return num;
        }
        return this.formatNumber(num);
    }
} 
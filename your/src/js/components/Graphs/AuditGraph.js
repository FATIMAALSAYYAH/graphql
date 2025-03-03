export class AuditGraph {
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
        
        // Color scheme - using more accessible colors
        this.colors = {
            'auditinnnnnng ratio': '#2ecc71',
            'Remaining': '#e74c3c'
        };
        
        // Get the auditinnnnnng ratio from the user data
        this.auditRatio = this.getAuditRatio();
        
        // Process data for the chart
        this.data = this.processData();
        
        // Make chart responsive
        this.containerWidth = this.container.clientWidth;
        this.width = this.containerWidth || 600;
        this.height = Math.min(400, this.width);
        this.margin = { top: 30, right: 30, bottom: 30, left: 30 };
        this.radius = Math.min(this.width, this.height) / 2.5 - this.margin.top;
    }

    getAuditRatio() {
        try {
            // Try to get the auditinnnnnng ratio from the global userData object
            if (window.userData && typeof window.userData.auditRatio === 'number') {
                return window.userData.auditRatio;
            }
            
            // If we can't find it in the global object, check if it's in the DOM
            const auditRatioElement = document.querySelector('.audit-ratio-value');
            if (auditRatioElement) {
                const ratioText = auditRatioElement.textContent.trim();
                const ratio = parseFloat(ratioText);
                if (!isNaN(ratio)) {
                    return ratio;
                }
            }
            
            // Default value if we can't find the auditinnnnnng ratio
            return 0.86; // Default value based on your example
        } catch (error) {
            console.error('Error getting auditinnnnnng ratio:', error);
            return 0.86; // Default value based on your example
        }
    }

    processData() {
        try {
            console.log('Processing auditinnnnnng ratio:', this.auditRatio);
            
            // Convert auditinnnnnng ratio to percentage (0-100)
            const ratioPercentage = Math.round(this.auditRatio * 100);
            const remainingPercentage = 100 - ratioPercentage;
            
            // Create data array for D3
            return [
                {
                    label: 'auditinnnnnng ratio',
                    value: ratioPercentage,
                    color: this.colors['auditinnnnnng ratio'],
                    percentage: ratioPercentage
                },
                {
                    label: 'Remaining',
                    value: remainingPercentage,
                    color: this.colors['Remaining'],
                    percentage: remainingPercentage
                }
            ];
        } catch (error) {
            console.error('Error in processData:', error);
            return [
                {label: 'Error', value: 1, color: '#e74c3c', percentage: 100}
            ];
        }
    }

    calculatePercentages() {
        try {
            const total = this.data.reduce((sum, entry) => sum + (entry.value || 0), 0);
            
            // Calculate percentages
            this.data.forEach(entry => {
                entry.percentage = total > 0 ? Math.round(((entry.value || 0) / total) * 100) : 0;
            });
            
            console.log('Calculated percentages:', this.data);
            return total;
        } catch (error) {
            console.error('Error calculating percentages:', error);
            return 0;
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
            
            // If no data, show no data message
            if (!this.data || this.data.length === 0) {
                this.container.innerHTML = `
                    <div class="no-data-message">
                        <p>No audit data available to display.</p>
                        <p>This could happen if you haven't participated in audits yet or if the data couldn't be retrieved.</p>
                    </div>
                `;
                return;
            }
            
            const svg = this.createSVG();
            this.drawDonutChart(svg);
            this.addCenterText(svg);
            this.addLegend(svg);
            this.addTooltips(svg);
        } catch (error) {
            console.error('Error rendering audit graph:', error);
            this.container.innerHTML = `
                <div class="no-data-message">
                    <p>Error rendering audit graph.</p>
                    <p>Please try refreshing the page or contact support if the issue persists.</p>
                </div>
            `;
        }
    }

    createSVG() {
        return d3.select(this.container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .append('g')
            .attr('transform', `translate(${this.width / 2},${this.height / 2})`);
    }

    drawDonutChart(svg) {
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null)
            .padAngle(0.03);

        // Create donut chart (with inner radius)
        const arc = d3.arc()
            .innerRadius(this.radius * 0.6) // Create a donut chart
            .outerRadius(this.radius)
            .cornerRadius(3); // Rounded corners

        // Arc for hover effect (slightly larger)
        const hoverArc = d3.arc()
            .innerRadius(this.radius * 0.58)
            .outerRadius(this.radius * 1.05)
            .cornerRadius(3);

        // Calculate the arcs
        const arcs = pie(this.data);

        // Create a group for each arc
        const arcGroups = svg.selectAll('.arc')
            .data(arcs)
            .enter()
            .append('g')
            .attr('class', 'arc');
        
        // Add the paths for each arc
        const paths = arcGroups
            .append('path')
            .attr('d', arc)
            .attr('fill', d => d.data.color)
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .style('opacity', 0.8)
            .style('cursor', 'pointer')
            .style('filter', 'drop-shadow(0px 3px 3px rgba(0,0,0,0.1))');

        // Add animation
        paths.transition()
            .duration(1000)
            .attrTween('d', function(d) {
                const i = d3.interpolate({startAngle: d.startAngle, endAngle: d.startAngle}, d);
                return function(t) {
                    return arc(i(t));
                };
            });

        // Add hover effect with smooth transition
        paths.on('mouseover', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('d', hoverArc)
                .style('opacity', 1)
                .style('filter', 'drop-shadow(0px 5px 5px rgba(0,0,0,0.2))');
        })
        .on('mouseout', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('d', arc)
                .style('opacity', 0.8)
                .style('filter', 'drop-shadow(0px 3px 3px rgba(0,0,0,0.1))');
        });
        
        // Only add labels if there's enough room (for large segments)
        arcGroups.filter(d => d.endAngle - d.startAngle > 0.4)
            .append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('dy', '0.35em')
            .style('text-anchor', 'middle')
            .style('fill', 'white')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('pointer-events', 'none')
            .text(d => d.data.percentage > 0 ? `${d.data.percentage}%` : '');
    }
    
    addCenterText(svg) {
        // Add center text group
        const centerText = svg.append('g')
            .attr('class', 'center-text');
        
        // Title
        centerText.append('text')
            .attr('y', -15)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('fill', '#34495e')
            .text('auditinnnnnng ratio');
        
        // Ratio value
        centerText.append('text')
            .attr('y', 15)
            .attr('text-anchor', 'middle')
            .style('font-size', '22px')
            .style('font-weight', 'bold')
            .style('fill', '#2c3e50')
            .text(this.auditRatio.toFixed(2));
    }

    addLegend(svg) {
        // Position the legend below the chart
        const legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(0, ${this.radius + 30})`);
        
        // Create legend items
        const legendItems = legend.selectAll('.legend-item')
            .data(this.data)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => {
                const itemWidth = 80;
                const totalWidth = this.data.length * itemWidth;
                const startX = -totalWidth / 2;
                return `translate(${startX + i * itemWidth}, 0)`;
            })
            .style('cursor', 'pointer')
            .on('mouseover', (event, d) => {
                // Highlight the corresponding pie segment
                svg.selectAll('.arc path')
                    .style('opacity', 0.3);
                
                svg.selectAll('.arc')
                    .filter(arc => arc.data.label === d.label)
                    .select('path')
                    .style('opacity', 1)
                    .style('filter', 'drop-shadow(0px 5px 5px rgba(0,0,0,0.2))');
            })
            .on('mouseout', () => {
                // Reset all segments
                svg.selectAll('.arc path')
                    .style('opacity', 0.8)
                    .style('filter', 'drop-shadow(0px 3px 3px rgba(0,0,0,0.1))');
            });
        
        // Add color boxes
        legendItems.append('rect')
            .attr('width', 12)
            .attr('height', 12)
            .attr('rx', 2)
            .style('fill', d => d.color);
        
        // Add labels
        legendItems.append('text')
            .attr('x', 16)
            .attr('y', 10)
            .style('font-size', '12px')
            .style('fill', '#34495e')
            .text(d => `${d.label} (${d.value})`);
    }
    
    addTooltips(svg) {
        // Create tooltip div
        const tooltip = d3.select(this.container)
            .append('div')
            .attr('class', 'graph-tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background-color', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '8px')
            .style('border-radius', '4px')
            .style('pointer-events', 'none')
            .style('z-index', 100)
            .style('font-size', '12px')
            .style('max-width', '200px');
        
        // Add mouseover/mouseout events for arcs
        svg.selectAll('.arc')
            .on('mouseover', function(event, d) {
                const { label, value, percentage } = d.data;
                
                tooltip.html(`
                    <div><strong>${label} Audits</strong></div>
                    <div>Count: ${value}</div>
                    <div>Percentage: ${percentage}%</div>
                `)
                .style('opacity', 0.9)
                .style('left', (event.pageX - tooltip.node().getBoundingClientRect().width / 2) + 'px')
                .style('top', (event.pageY - tooltip.node().getBoundingClientRect().height - 10) + 'px');
            })
            .on('mouseout', function() {
                tooltip.style('opacity', 0);
            })
            .on('mousemove', function(event) {
                tooltip
                    .style('left', (event.pageX - tooltip.node().getBoundingClientRect().width / 2) + 'px')
                    .style('top', (event.pageY - tooltip.node().getBoundingClientRect().height - 10) + 'px');
            });
    }
} 
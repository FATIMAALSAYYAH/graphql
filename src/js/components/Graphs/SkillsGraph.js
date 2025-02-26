export class SkillsGraph {
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
        
        this.rawData = data;
        console.log('SkillsGraph constructor received data:', this.rawData);
        
        this.data = this.processData(data);
        
        // Make chart responsive but maintain minimum dimensions
        this.containerWidth = this.container.clientWidth;
        this.width = Math.max(this.containerWidth, 250);
        this.height = 250; // Fixed height for better visibility
        
        // Ensure container is at least as tall as the graph
        this.container.style.minHeight = `${this.height}px`;
        
        // Adjust margins to center the chart better
        this.margin = { top: 30, right: 30, bottom: 30, left: 30 };
        this.radius = Math.min(this.width, this.height) / 2.5; // Slightly smaller radius
        
        // Color for the radar area
        this.areaColor = "rgba(138, 123, 217, 0.6)"; // Light purple as in your image
        this.lineColor = "rgba(138, 123, 217, 0.9)"; // Darker purple for the outline
        
        console.log(`Creating skills graph with dimensions: ${this.width}x${this.height}`);
    }
    
    processData(rawData) {
        console.log('Processing data in SkillsGraph:', rawData);
        
        // If no data provided, use default data
        if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
            console.log('No valid data provided, using default data');
            return this.getDefaultSkillsData();
        }
        
        // Map skill types to display names
        const skillDisplayNames = {
            "skill_prog": "Prog",
            "skill_go": "Go",
            "skill_back-end": "Back-End",
            "skill_front-end": "Front-End",
            "skill_js": "Js",
            "skill_php": "Php"
        };
        
        // Find maximum amount for normalization
        let maxAmount = 0;
        rawData.forEach(skill => {
            if (skill.amount && skill.amount > maxAmount) {
                maxAmount = skill.amount;
            }
        });
        
        // Ensure we don't divide by zero
        maxAmount = Math.max(maxAmount, 100);
        
        // Process the raw data into the format needed for radar chart
        const processedData = [];
        const skillTypes = ["skill_prog", "skill_go", "skill_back-end", "skill_front-end", "skill_js", "skill_php"];
        
        // Add each skill to the processed data
        skillTypes.forEach(skillType => {
            const skill = rawData.find(s => s.type === skillType);
            
            if (skill && skill.amount) {
                // Normalize to 0-1 range
                let normalizedValue = skill.amount / maxAmount;
                
                // Ensure we have at least a minimum value for visibility
                normalizedValue = Math.max(normalizedValue, 0.1);
                
                processedData.push({
                    axis: skillDisplayNames[skillType],
                    value: normalizedValue
                });
                
                console.log(`Processed ${skillType}: ${skill.amount} -> ${normalizedValue}`);
            } else {
                // If skill not found, add with minimum value
                processedData.push({
                    axis: skillDisplayNames[skillType],
                    value: 0.1 // Minimum value for visibility
                });
                
                console.log(`Skill ${skillType} not found, using default value 0.1`);
            }
        });
        
        console.log('Final processed data for radar chart:', processedData);
        return processedData;
    }
    
    getDefaultSkillsData() {
        // Default data if no real data is available - matches the image example
        return [
            {axis: "Prog", value: 0.7},
            {axis: "Go", value: 0.55},
            {axis: "Back-End", value: 0.65},
            {axis: "Front-End", value: 0.6},
            {axis: "Js", value: 0.58},
            {axis: "Php", value: 0.45}
        ];
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
            
            // Create a container div with the new CSS class
            const skillsGraphContainer = document.createElement('div');
            skillsGraphContainer.className = 'skills-graph-container';
            this.container.appendChild(skillsGraphContainer);
            
            // If no data, show no data message
            if (!this.data || this.data.length === 0) {
                skillsGraphContainer.innerHTML = `
                    <div class="no-data-message">
                        <p>No skills data available to display.</p>
                    </div>
                `;
                return;
            }
            
            console.log('Rendering radar chart with data:', this.data);
            
            const svg = this.createSVG(skillsGraphContainer);
            this.drawRadarChart(svg);
            
            // Add a skills legend
            this.addSkillsLegend(skillsGraphContainer);
        } catch (error) {
            console.error('Error rendering skills graph:', error);
            this.container.innerHTML = `
                <div class="no-data-message">
                    <p>Error rendering skills graph.</p>
                    <p>Please try refreshing the page or contact support if the issue persists.</p>
                </div>
            `;
        }
    }

    createSVG(container) {
        // Create SVG container div with the new CSS class
        const svgContainer = document.createElement('div');
        svgContainer.className = 'skills-svg-container';
        container.appendChild(svgContainer);
        
        // Create SVG element with explicit dimensions
        const svg = d3.select(svgContainer)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .style('overflow', 'visible'); // Allow elements to extend beyond SVG borders
            
        // Add the center transform group with the new radar-chart class
        return svg.append('g')
            .attr('class', 'radar-chart')
            .attr('transform', `translate(${this.width / 2},${this.height / 2})`);
    }
    
    drawRadarChart(svg) {
        const cfg = {
            levels: 3,           // Number of concentric circles (reduced from 5)
            labelFactor: 1.25,   // Distance from edge for axis labels (increased)
            axisLineWidth: 1.5,  // Width of the axis lines
            opacityArea: 0.6,    // Opacity of the radar area
            dotRadius: 5,        // Radius of dots at data points
            opacityCircles: 0.1, // Opacity of the concentric circles
            strokeWidth: 2.5,    // Width of the outline of the area
            roundStrokes: true,  // Whether to use rounded strokes for the area outline
            color: d3.scaleOrdinal().range([this.areaColor]), // Color of the area
        };
        
        // Maximum value of data - could be adjusted based on max value in data
        const maxValue = 1;
        
        // Calculate angles for each axis
        const total = this.data.length;
        const angleSlice = Math.PI * 2 / total;
        
        // Scale for the radius
        const rScale = d3.scaleLinear()
            .range([0, this.radius])
            .domain([0, maxValue]);
            
        // Draw background concentric circles
        const axisGrid = svg.append("g").attr("class", "axisWrapper");
        
        axisGrid.selectAll(".radar-level")
           .data(d3.range(1, cfg.levels + 1).reverse())
           .enter()
           .append("circle")
           .attr("class", "radar-level")
           .attr("r", d => this.radius / cfg.levels * d)
           .style("fill", "none")
           .style("stroke", "rgba(200, 200, 220, 0.3)")
           .style("stroke-width", "1px");
           
        // Draw axis lines
        const axis = axisGrid.selectAll(".axis")
            .data(this.data)
            .enter()
            .append("g")
            .attr("class", "axis");
            
        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y2", (d, i) => rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("class", "radar-axis")
            .style("stroke", "rgba(180, 180, 200, 0.4)")
            .style("stroke-width", "1.5px")
            .style("stroke-dasharray", "3, 3");
            
        // Draw axis labels
        axis.append("text")
            .attr("class", "radar-label")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", (d, i) => rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y", (d, i) => rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2))
            .text(d => d.axis);
            
        // Draw the radar chart area
        const radarLine = d3.lineRadial()
            .curve(d3.curveLinearClosed)
            .radius(d => rScale(d.value))
            .angle((d, i) => i * angleSlice);
            
        // Create a wrapper for the data points
        const radarWrapper = svg.append("g")
            .attr("class", "radarWrapper");
            
        // Draw the radar area
        radarWrapper.append("path")
            .datum(this.data)
            .attr("class", "radar-area")
            .attr("d", radarLine)
            .style("fill", this.areaColor)
            .style("stroke", this.lineColor)
            .style("stroke-width", cfg.strokeWidth)
            .style("stroke-linejoin", "round");
            
        // Add dots at each data point
        radarWrapper.selectAll(".radar-circle")
            .data(this.data)
            .enter()
            .append("circle")
            .attr("class", "radar-circle")
            .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("r", cfg.dotRadius);
            
        // Add value labels that appear on hover
        radarWrapper.selectAll(".radar-value")
            .data(this.data)
            .enter()
            .append("text")
            .attr("class", "radar-value")
            .attr("x", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2) - 15)
            .text(d => Math.round(d.value * 100) + '%');
    }
    
    addSkillsLegend(container) {
        // Create a skills legend
        const legend = document.createElement('div');
        legend.className = 'skills-legend';
        
        // Add legend title
        const title = document.createElement('div');
        title.textContent = 'Skills';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '8px';
        legend.appendChild(title);
        
        // Add legend item
        const item = document.createElement('div');
        item.className = 'skills-legend-item';
        
        const colorBox = document.createElement('div');
        colorBox.className = 'skills-legend-color';
        item.appendChild(colorBox);
        
        const label = document.createElement('div');
        label.className = 'skills-legend-label';
        label.textContent = 'Skill Level';
        item.appendChild(label);
        
        legend.appendChild(item);
        
        // Add legend to container
        container.appendChild(legend);
    }
} 
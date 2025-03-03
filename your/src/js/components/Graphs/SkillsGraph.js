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
        
        // Colors for the skills graph
        this.colors = {
            mainFill: 'rgba(138, 123, 217, 0.6)', 
            mainStroke: 'var(--primary-color)', 
            circles: 'var(--primary-color)', 
            grid: 'rgba(180, 180, 200, 0.4)', 
            axes: 'rgba(180, 180, 200, 0.4)', 
            labels: 'var(--text-dark)' 
        };
        
        // Set up dimensions
        this.width = 500;
        this.height = 500;
        this.center = { x: this.width / 2, y: this.height / 2 };
        this.radius = Math.min(this.width, this.height) / 2 - 60;
        
        // For the radar chart
        this.levelCount = 5; // Number of concentric circles
        this.angleSlice = (Math.PI * 2) / this.getProcessedData().length;
        
        // Store original skill values for display
        this.skillValues = this.getSkillValues();
    }
    
    render() {
        if (!this.d3Available) {
            this.container.innerHTML = '<div class="error">D3.js is required for this visualization.</div>';
            return;
        }
        
        if (!this.rawData || !Array.isArray(this.rawData) || this.rawData.length === 0) {
            this.container.innerHTML = '<div class="no-data-message">No skills data available.</div>';
            return;
        }
        
        // Clear previous content
        this.container.innerHTML = '';
        
        // Create container with dark background
        const graphContainer = document.createElement('div');
        graphContainer.className = 'skills-graph-container';
        this.container.appendChild(graphContainer);
        
        // Create content container for text
        const contentContainer = document.createElement('div');
        contentContainer.className = 'skills-content';
        graphContainer.appendChild(contentContainer);
        
        // Add title and subtitle
        const titleContainer = document.createElement('div');
        titleContainer.className = 'skills-header';
        
        const title = document.createElement('h3');
        title.textContent = 'Best skills';
        title.className = 'skills-title';
        
        const subtitle = document.createElement('p');
        subtitle.textContent = 'Here are your skills with the highest completion rate among all categories.';
        subtitle.className = 'skills-subtitle';
        
        titleContainer.appendChild(title);
        titleContainer.appendChild(subtitle);
        contentContainer.appendChild(titleContainer);
        
        // Add arrow link without "SEE MORE" text
        const seeMore = document.createElement('a');
        seeMore.textContent = '→';
        seeMore.href = '#';
        seeMore.className = 'skills-see-more';
        contentContainer.appendChild(seeMore);
        
        // Create SVG container
        const svgContainer = document.createElement('div');
        svgContainer.className = 'skills-svg-container';
        graphContainer.appendChild(svgContainer);
        
        // Create the SVG
        const svg = d3.select(svgContainer)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .append('g')
            .attr('transform', `translate(${this.center.x}, ${this.center.y})`);
        
        // Draw the visualization
        this.drawGrid(svg);
        this.drawAxes(svg);
        this.drawChart(svg);
    }
    
    getProcessedData() {
        try {
            if (!this.rawData || !Array.isArray(this.rawData)) {
                console.warn('Skills data is not in expected format');
                return [];
            }
            
            // Map skill types to friendly names
            const skillMapping = {
                'skill_prog': 'Prog',
                'skill_go': 'Go',
                'skill_back-end': 'Back-End',
                'skill_front-end': 'Front-End',
                'skill_js': 'JS',
                'skill_php': 'Php'
            };
            
            // Define fixed demonstration values for the skills
            // These should be replaced with actual values from your data source
            const fixedSkillValues = {
                'skill_prog': 85.0,
                'skill_go': 55.0,
                'skill_back-end': 50.0,
                'skill_front-end': 40.0,
                'skill_js': 40.0,
                'skill_php': 35.0
            };
            
            // Convert to array format for radar chart
            const result = Object.entries(skillMapping).map(([type, displayName]) => {
                // Get the value from our fixed values
                const skillValue = fixedSkillValues[type] || 0;
                
                // Normalize amount to a value between 0 and 1
                // Maximum value is 100.0 for full radar chart coverage
                const normalizedValue = Math.min(Math.max(skillValue / 100, 0), 1);
                
                return {
                    axis: displayName,
                    value: normalizedValue,
                    rawValue: skillValue
                };
            });
            
            return result;
        } catch (error) {
            console.error('Error processing skills data:', error);
            return [];
        }
    }
    
    getSkillValues() {
        // Create a map of skill names to raw values
        const skillData = this.getProcessedData();
        const skillValues = {};
        
        skillData.forEach(skill => {
            skillValues[skill.axis] = skill.rawValue;
        });
        
        return skillValues;
    }
    
    drawGrid(svg) {
        const levels = [...Array(this.levelCount).keys()].map(i => (i + 1) / this.levelCount);
        
        // Draw the circular grid
        levels.forEach(level => {
            svg.append('circle')
                .attr('cx', 0)
                .attr('cy', 0)
                .attr('r', this.radius * level)
                .attr('class', 'radar-grid-circle');
        });
    }
    
    drawAxes(svg) {
        const data = this.getProcessedData();
        const allAxes = data.map((d, i) => {
            const angle = i * this.angleSlice;
            return {
                name: d.axis,
                value: d.rawValue,
                x: this.radius * Math.sin(angle),
                y: -this.radius * Math.cos(angle),
                angle: angle
            };
        });
        
        // Draw the axes
        const axes = svg.selectAll('.axis')
            .data(allAxes)
           .enter()
            .append('g')
            .attr('class', 'axis');
           
        // Draw axis lines
        axes.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', d => d.x)
            .attr('y2', d => d.y)
            .attr('class', 'axis-line');
        
        // Add axis labels
        axes.append('text')
            .attr('class', 'axis-label')
            .attr('text-anchor', d => {
                if (Math.abs(d.x) < 10) return 'middle';
                return d.x > 0 ? 'start' : 'end';
            })
            .attr('dy', d => {
                if (Math.abs(d.y) < 10) return d.y > 0 ? '-0.5em' : '1em';
                return '0.35em';
            })
            .attr('x', d => d.x * 1.15)
            .attr('y', d => d.y * 1.15)
            .text(d => d.name);
        
        // Add value display for each axis
        axes.append('text')
            .attr('class', 'axis-value')
            .attr('text-anchor', d => {
                if (Math.abs(d.x) < 10) return 'middle';
                return d.x > 0 ? 'start' : 'end';
            })
            .attr('dy', d => {
                if (Math.abs(d.y) < 10) return d.y > 0 ? '-2em' : '2.5em';
                return '1.5em';
            })
            .attr('x', d => d.x * 1.15)
            .attr('y', d => d.y * 1.15)
            .text(d => d.value.toFixed(1));
    }
    
    drawChart(svg) {
        const data = this.getProcessedData();
        
        // Generate the radar area path
        const radarLine = d3.lineRadial()
            .radius(d => d.value * this.radius)
            .angle((d, i) => i * this.angleSlice)
            .curve(d3.curveLinearClosed);
            
        // Draw the radar area
        svg.append('path')
            .datum(data)
            .attr('class', 'radar-area')
            .attr('d', radarLine);
            
        // Add dots at each data point
        data.forEach((d, i) => {
            const angle = i * this.angleSlice;
            const x = this.radius * d.value * Math.sin(angle);
            const y = -this.radius * d.value * Math.cos(angle);
            
            svg.append('circle')
                .attr('class', 'radar-point')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 5);
        });
    }
    }

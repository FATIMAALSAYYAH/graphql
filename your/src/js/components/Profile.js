import { Auth } from '../api/auth.js'
import { Login } from './Login.js'
import { SkillsGraph } from './Graphs/SkillsGraph.js'
import { AuditBarGraph } from './Graphs/AuditBarGraph.js'
import { GET_USER_SKILLS, GET_USER_LEVEL } from '../../queries.js'

export class Profile {
    constructor(container) {
        this.container = container
        this.auth = new Auth()
        this.graphql = this.auth.graphql
        this.userData = null
        this.userProjects = null
        this.userSkills = null
        this.loading = {
            userData: true,
            projects: true,
            skills: true
        }
    }

    async fetchUserData() {
        const query = `
            query {
                user {
                    id
                    login
                    firstName
                    lastName
                    email
                    auditRatio
                    totalUp
                    totalDown
                    transactions(where: {type: {_eq: "xp"}}, order_by: {createdAt: asc}) {
                        id
                        type
                        amount
                        createdAt
                        path
                    }
                    progresses(where: {grade: {_is_null: false}}, order_by: {createdAt: desc}) {
                        id
                        grade
                        createdAt
                        object {
                            name
                            type
                        }
                    }
                }
            }
        `

        try {
            const response = await this.graphql.query(query)
            
            console.log('Fetched user data:', response.data)
            
            // Make sure we have valid data in the expected format
            if (!response.data) {
                throw new Error('Invalid response format - no data')
            }
            
            // Check if user is an array or object
            if (response.data.user) {
                if (Array.isArray(response.data.user)) {
                    // If it's an array, use the first element
                    if (response.data.user.length > 0) {
                        this.userData = response.data.user[0]
                    } else {
                        throw new Error('User data array is empty')
                    }
                } else {
                    // If it's an object, use it directly
                    this.userData = response.data.user
                }
            } else {
                throw new Error('Invalid response format - no user data')
            }
            
            this.loading.userData = false
            return this.userData
        } catch (error) {
            this.loading.userData = false
            if (error.message.includes('Authentication')) {
                localStorage.removeItem('jwt')
                window.location.reload()
                return
            }
            throw error
        }
    }
    
    async fetchSkillsData() {
        try {
            if (!this.userData || !this.userData.id) {
                console.warn('User ID not available, cannot fetch skills data')
                this.loading.skills = false
                return null
            }
            
            const userId = this.userData.id
            console.log('Fetching skills data for user ID:', userId)
            
            // Use the imported query
            const response = await this.graphql.query(GET_USER_SKILLS, { userId })
            
            console.log('Skills data response:', response)
            
            if (response.data && response.data.user) {
                // If user is an array, use the first element
                if (Array.isArray(response.data.user) && response.data.user.length > 0) {
                    this.userSkills = response.data.user[0].transactions || []
                } else {
                    // Otherwise use the direct object
                    this.userSkills = response.data.user.transactions || []
                }
                
                console.log('Skills data loaded:', this.userSkills)
            }
            
            this.loading.skills = false
            return this.userSkills
        } catch (error) {
            console.error('Error fetching skills data:', error)
            this.loading.skills = false
            return null
        }
    }

    async fetchUserProjects() {
        const query = `
            query {
                group(where: {members: {userId: {_eq: ${this.userData?.id || 0}}}}, order_by: {updatedAt: desc}) {
                    id
                    path
                    status
                    createdAt
                    updatedAt
                    members {
                        userId
                        user {
                            login
                        }
                    }
                    results {
                        grade
                    }
                }
            }
        `

        try {
            const response = await this.graphql.query(query)
            
            console.log('Fetched user projects:', response.data)
            
            if (!response.data) {
                throw new Error('Invalid projects response format - no data')
            }
            
            // Check if group is an array or object
            if (response.data.group) {
                if (Array.isArray(response.data.group)) {
                    // If it's already an array, use it directly
                    this.userProjects = response.data.group
                } else {
                    // If it's an object, convert to array with one element
                    this.userProjects = [response.data.group]
                }
            } else {
                // No projects found, set to empty array
                this.userProjects = []
            }
            
            this.loading.projects = false
            return this.userProjects
        } catch (error) {
            this.loading.projects = false
            console.error('Failed to fetch projects:', error)
            return []
        }
    }

    calculateTotalXP(transactions) {
        if (!transactions || !Array.isArray(transactions)) return 0
        
        return transactions.reduce((total, tx) => {
            return total + (tx.amount || 0)
        }, 0)
    }

    formatAuditRatio(ratio) {
        if (ratio === null || ratio === undefined) return 'N/A'
        
        return ratio.toFixed(2)
    }

    formatToMB(number) {
        if (!number) return '0 MB';
        // Convert to MB (1 MB = 1,000,000 for simplicity)
        const mbValue = (number / 1000000).toFixed(2);
        // Format with 2 decimal places
        return mbValue + ' MB';
    }

    async fetchUserLevel() {
        try {
            if (!this.userData || !this.userData.id) {
                console.warn('User ID not available, cannot fetch user level')
                return null
            }
            
            const userId = this.userData.id
            console.log('Fetching level data for user ID:', userId)
            
            // Use the imported query
            const response = await this.graphql.query(GET_USER_LEVEL, { userId })
            
            console.log('Level data response:', response)
            
            if (response.data && response.data.event_user && response.data.event_user.length > 0) {
                const level = response.data.event_user[0].level
                console.log('User level:', level)
                return level
            }
            
            return null
        } catch (error) {
            console.error('Error fetching user level:', error)
            return null
        }
    }

    render() {
        if (!this.auth.isAuthenticated()) {
            console.log('User not authenticated, showing login')
            const login = new Login(this.container)
            login.render()
            return
        }

        console.log('Rendering profile page...')
        this.container.innerHTML = `
            <div class="profile-container">
                <div class="profile-header">
                    <h2>User Profile</h2>
                    <button id="logout-button">Logout</button>
                </div>
                <div id="user-info" class="loading">
                    <div class="loader"></div>
                    <p>Loading user data...</p>
                </div>
                <div id="projects-info" class="loading">
                    <div class="loader"></div>
                    <p>Loading projects...</p>
                </div>
                <div class="graphs-container">
                    <div class="graph-box">
                        <h3>Skills</h3>
                        <div id="skills-graph"></div>
                    </div>
                    <div class="graph-box">
                        <h3>Audit Statistics</h3>
                        <div id="audit-graph"></div>
                    </div>
                </div>
                <div id="error-message" class="error"></div>
            </div>
        `
        
        // Attach logout event listener
        document.getElementById('logout-button').addEventListener('click', () => {
            this.auth.logout()
        })
        
        this.loadData()
    }

    async loadData() {
        try {
            // Fetch user data first
            await this.fetchUserData()
            
            // Then fetch projects, skills, and level in parallel
            const [projects, skills, userLevel] = await Promise.all([
                this.fetchUserProjects(),
                this.fetchSkillsData(),
                this.fetchUserLevel()
            ])
            
            // Make sure userData exists
            if (!this.userData) {
                throw new Error('No user data received')
            }
            
            // Add level to userData
            this.userData.level = userLevel
            
            // Debug logs
            console.log('User data loaded:', this.userData)
            console.log('Projects data loaded:', projects)
            console.log('Skills data loaded:', skills)
            console.log('User level loaded:', userLevel)
            
            // Update UI with the data
            this.updateUserInfo(this.userData)
            this.updateProjectsInfo(projects)
            
            // Handle Skills Graph
            this.renderSkillsGraph(this.userSkills)
            
            // Handle Audit Bar Graph
            this.renderAuditGraph(this.userData)
            
        } catch (error) {
            console.error('Failed to load profile data:', error)
            
            const errorElement = document.getElementById('error-message')
            if (errorElement) {
                errorElement.textContent = `Error: ${error.message}`
            }
            
            console.log('Detailed load data error:', error)
        }
    }
    
    renderSkillsGraph(skillsData) {
        try {
            if (skillsData && Array.isArray(skillsData) && skillsData.length > 0) {
                console.log(`Found ${skillsData.length} skills entries for Skills graph`)
                console.log('Skills data being passed to SkillsGraph:', skillsData)
                
                const skillsGraphContainer = document.getElementById('skills-graph')
                if (skillsGraphContainer) {
                    // Explicitly pass the skills data to the SkillsGraph constructor
                    const skillsGraph = new SkillsGraph('skills-graph', skillsData)
                    skillsGraph.render()
                }
            } else {
                console.warn('No skills data available for Skills graph:', skillsData)
                
                // Add placeholder for missing skills data
                const skillsGraphContainer = document.getElementById('skills-graph')
                if (skillsGraphContainer) {
                    skillsGraphContainer.innerHTML = `
                        <div class="no-data-message">
                            <p>No skills data available to display.</p>
                            <p>This could happen if you haven't earned any skills yet or if the data couldn't be retrieved.</p>
                        </div>
                    `
                }
            }
        } catch (skillsError) {
            console.error('Error rendering Skills graph:', skillsError)
            const skillsGraphContainer = document.getElementById('skills-graph')
            if (skillsGraphContainer) {
                skillsGraphContainer.innerHTML = `
                    <div class="no-data-message">
                        <p>Error rendering Skills graph.</p>
                        <p>Please try refreshing the page or contact support if the issue persists.</p>
                    </div>
                `
            }
        }
    }

    renderAuditGraph(userData) {
        try {
            if (userData && userData.auditRatio !== undefined) {
                console.log('Rendering audit bar graph with data:', {
                    totalUp: userData.totalUp,
                    totalDown: userData.totalDown
                })
                
                // Make userData available globally for the AuditBarGraph component
                window.userData = userData
                
                const auditGraphContainer = document.getElementById('audit-graph')
                if (auditGraphContainer) {
                    const auditGraph = new AuditBarGraph('audit-graph')
                    auditGraph.render()
                }
            } else {
                console.warn('No audit data available for Audit graph')
                
                // Add placeholder for missing audit data
                const auditGraphContainer = document.getElementById('audit-graph')
                if (auditGraphContainer) {
                    auditGraphContainer.innerHTML = `
                        <div class="no-data-message">
                            <p>No audit data available to display.</p>
                        </div>
                    `
                }
            }
        } catch (auditError) {
            console.error('Error rendering Audit graph:', auditError)
            const auditGraphContainer = document.getElementById('audit-graph')
            if (auditGraphContainer) {
                auditGraphContainer.innerHTML = `
                    <div class="no-data-message">
                        <p>Error rendering Audit graph.</p>
                        <p>Please try refreshing the page or contact support if the issue persists.</p>
                    </div>
                `
            }
        }
    }

    updateUserInfo(userData) {
        const userInfoElement = document.getElementById('user-info')
        if (!userInfoElement) {
            throw new Error('User info element not found')
        }
        
        userInfoElement.classList.remove('loading')
        
        // Add detailed debugging
        console.log('Updating user info with data:', userData)
        console.log('User login:', userData.login)
        console.log('User name:', userData.firstName, userData.lastName)
        console.log('User email:', userData.email)
        console.log('User transactions:', userData.transactions)
        console.log('User audit ratio:', userData.auditRatio)
        console.log('User totalUp:', userData.totalUp)
        console.log('User totalDown:', userData.totalDown)
        
        const fullName = [userData.firstName, userData.lastName].filter(Boolean).join(' ')
        
        userInfoElement.innerHTML = `
            <div class="user-info-card">
                <h3>${userData.login || 'Anonymous'}</h3>
                ${fullName ? `<p><strong>Name:</strong> ${fullName}</p>` : ''}
                <p><strong>Email:</strong> ${userData.email || 'N/A'}</p>
                <p><strong>Audit Ratio:</strong> ${this.formatAuditRatio(userData.auditRatio)}</p>
                <p><strong>Audits Done (Up):</strong> ${this.formatToMB(userData.totalUp)}</p>
                <p><strong>Audits Received (Down):</strong> ${this.formatToMB(userData.totalDown)}</p>
            </div>
        `
    }

    updateProjectsInfo(projects) {
        const projectsInfoElement = document.getElementById('projects-info')
        if (!projectsInfoElement) {
            return
        }
        
        projectsInfoElement.classList.remove('loading')
        
        if (!projects || projects.length === 0) {
            projectsInfoElement.innerHTML = `
                <div class="projects-card">
                    <h3>Projects</h3>
                    <p>No projects found.</p>
                </div>
            `
            return
        }
        
        // Count completed projects
        const completedProjects = projects.filter(p => p.status === 'finished' || p.results?.length > 0)
        
        // Format user level for display - show only the integer part
        const userLevel = this.userData.level ? Math.floor(parseFloat(this.userData.level)) : 'N/A'
        
        // Show recent projects (up to 5)
        const recentProjects = projects.slice(0, 5)
        
        projectsInfoElement.innerHTML = `
            <div class="projects-card">
                <h3>Projects</h3>
                <div class="project-stats">
                    <div class="stat-item">
                        <span class="stat-value">${projects.length}</span>
                        <span class="stat-label">Total</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${completedProjects.length}</span>
                        <span class="stat-label">Completed</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${userLevel}</span>
                        <span class="stat-label">Level</span>
                    </div>
                </div>
                <h4>Recent Projects</h4>
                <ul class="recent-projects-list">
                    ${recentProjects.map(project => `
                        <li>
                            <span class="project-path">${project.path || 'Unknown'}</span>
                            <span class="project-status ${project.status || 'unknown'}">${project.status || 'Unknown'}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `
    }
}
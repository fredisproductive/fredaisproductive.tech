import { useState, useEffect, useRef } from 'react'

const imgLinkedin = "/assets/linkedin.png"
const imgGithub = "/assets/github.png"
const imgLine11 = "/assets/line11.png"
const imgLine12 = "/assets/line12.png"
const imgLine13 = "/assets/line13.png"
const imgLine14 = "/assets/line14.png"

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [activeSection, setActiveSection] = useState('about')
  const [isHovering, setIsHovering] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [lineStart, setLineStart] = useState(0)
  const [lineEnd, setLineEnd] = useState(0)
  const navRef = useRef(null)
  const contentRef = useRef(null)
  const hoverTimeoutRef = useRef(null)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'work', 'extracurriculars', 'projects']
      
      // Line starts at ASCII art top (73px) and ends 50px before bottom of viewport
      const startY = 73
      const endY = window.innerHeight - 50
      
      setLineStart(startY)
      setLineEnd(endY)
      
      // Calculate scroll progress from content wrapper scroll
      if (contentRef.current) {
        const contentEl = contentRef.current
        let scrollTop = contentEl.scrollTop
        
        // Prevent scrolling past ASCII star top (minimum scroll is 0)
        if (scrollTop < 0) {
          contentEl.scrollTop = 0
          scrollTop = 0
        }
        
        const scrollHeight = contentEl.scrollHeight
        const clientHeight = contentEl.clientHeight
        const maxScroll = scrollHeight - clientHeight
        
        // Use viewport center for section detection to match what's actually visible
        const viewportCenter = scrollTop + clientHeight / 2

        // Determine active section based on viewport center position
        let foundSection = null
        let sectionProgress = 0
        
        for (const sectionId of sections) {
          const element = document.getElementById(sectionId)
          if (element) {
            // Get element position relative to content wrapper
            const elementOffsetTop = element.offsetTop
            const elementHeight = element.offsetHeight
            const elementBottom = elementOffsetTop + elementHeight
            const elementCenter = elementOffsetTop + elementHeight / 2
            
            // Check if viewport center is within this section
            if (viewportCenter >= elementOffsetTop && viewportCenter < elementBottom) {
              foundSection = sectionId
              // Calculate progress based on where this section's center is in the content
              // Map to progress line (0 to 1) based on scrollable height
              sectionProgress = maxScroll > 0 
                ? Math.min(Math.max((elementCenter - clientHeight / 2) / maxScroll, 0), 1)
                : 0
              break
            }
          }
        }
        
        // Fallback: if no section matches, find the closest one
        if (!foundSection) {
          let closestSection = sections[0]
          let minDistance = Infinity
          
          sections.forEach(section => {
            const element = document.getElementById(section.id)
            if (element) {
              const elementOffsetTop = element.offsetTop
              const elementHeight = element.offsetHeight
              const elementCenter = elementOffsetTop + elementHeight / 2
              const distance = Math.abs(viewportCenter - elementCenter)
              if (distance < minDistance) {
                minDistance = distance
                closestSection = section
              }
            }
          })
          
          foundSection = closestSection.id
          
          // Calculate progress for closest section
          const closestElement = document.getElementById(foundSection)
          if (closestElement) {
            const elementOffsetTop = closestElement.offsetTop
            const elementHeight = closestElement.offsetHeight
            const elementCenter = elementOffsetTop + elementHeight / 2
            sectionProgress = maxScroll > 0 
              ? Math.min(Math.max((elementCenter - clientHeight / 2) / maxScroll, 0), 1)
              : 0
          }
        }
        
        if (foundSection) {
          setActiveSection(foundSection)
          setScrollProgress(sectionProgress)
        }
      }
    }

    const contentEl = contentRef.current
    if (contentEl) {
      // Prevent scrolling past the top (ASCII star top / progress line start)
      const handleScrollWithConstraint = () => {
        // Enforce minimum scroll position (can't scroll past ASCII star top)
        if (contentEl.scrollTop < 0) {
          contentEl.scrollTop = 0
          return // Don't process scroll if we just corrected it
        }
        handleScroll()
      }
      
      // Set initial scroll position to show ASCII star at progress line start
      // With padding-top: 76px, scrollTop = 0 aligns ASCII star with wrapper top
      contentEl.scrollTop = 0
      
      contentEl.addEventListener('scroll', handleScrollWithConstraint)
      window.addEventListener('resize', handleScroll)
      handleScroll() // Initial check
      return () => {
        contentEl.removeEventListener('scroll', handleScrollWithConstraint)
        window.removeEventListener('resize', handleScroll)
      }
    }
  }, [lineStart, lineEnd])

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    const contentEl = contentRef.current
    if (element && contentEl) {
      if (id === 'about') {
        // For "about" section, align ASCII star top with progress bar start
        // Content wrapper has padding-top: 76px, so ASCII star aligns with wrapper top when scrollTop = 0
        contentEl.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      } else {
        // For other sections, position title 50px below progress bar start
        const sectionTitle = element.querySelector('h2')
        
        if (sectionTitle) {
          // Calculate title position relative to content wrapper
          const wrapperRect = contentEl.getBoundingClientRect()
          const titleRect = sectionTitle.getBoundingClientRect()
          const currentScrollTop = contentEl.scrollTop
          const titleOffsetTop = titleRect.top - wrapperRect.top + currentScrollTop
          
          // Position title 50px below progress bar start
          // Content wrapper top is at progress line start (73px from viewport)
          // So title should be at 50px from top of visible area (wrapper top)
          const targetScroll = titleOffsetTop - 50
          
          contentEl.scrollTo({
            top: Math.max(0, targetScroll),
            behavior: 'smooth'
          })
        } else {
          // Fallback: use section element itself
          const wrapperRect = contentEl.getBoundingClientRect()
          const elementRect = element.getBoundingClientRect()
          const currentScrollTop = contentEl.scrollTop
          const elementOffsetTop = elementRect.top - wrapperRect.top + currentScrollTop
          
           contentEl.scrollTo({
             top: Math.max(0, elementOffsetTop - 50),
             behavior: 'smooth'
           })
        }
      }
      setActiveSection(id)
    }
  }

  const sections = [
    { id: 'about', label: 'about', emoji: '⊹' },
    { id: 'work', label: 'work', emoji: 'ೃ' },
    { id: 'extracurriculars', label: 'extracurriculars', emoji: '☼' },
    { id: 'projects', label: 'projects', emoji: '⊹' },
  ]

  const [sectionPositions, setSectionPositions] = useState({})

  // Calculate section positions dynamically relative to line height
  useEffect(() => {
    const calculatePositions = () => {
      const positions = {}
      const lineHeight = lineEnd - lineStart
      const contentEl = contentRef.current
      
      if (lineHeight <= 0 || !contentEl) return
      
      sections.forEach(section => {
        const element = document.getElementById(section.id)
        if (element) {
          // Get element position relative to content wrapper (accounting for padding)
          const elementOffsetTop = element.offsetTop
          const contentScrollHeight = contentEl.scrollHeight
          const contentClientHeight = contentEl.clientHeight
          
          // Calculate position as percentage of scrollable content
          const scrollableHeight = contentScrollHeight - contentClientHeight
          if (scrollableHeight > 0) {
            // Map element position to progress line position
            const elementProgress = elementOffsetTop / scrollableHeight
            positions[section.id] = Math.max(0, Math.min(1, elementProgress))
          }
        }
      })
      
      setSectionPositions(positions)
    }

    if (lineEnd > lineStart && contentRef.current) {
      calculatePositions()
      const contentEl = contentRef.current
      contentEl.addEventListener('scroll', calculatePositions)
      window.addEventListener('resize', calculatePositions)
      return () => {
        contentEl.removeEventListener('scroll', calculatePositions)
        window.removeEventListener('resize', calculatePositions)
      }
    }
  }, [lineStart, lineEnd])

  return (
    <div 
      className="dot-pattern relative w-full" 
      style={{ 
        minHeight: '100vh', 
        paddingBottom: '100px'
      }}
    >
      {/* Top border */}
      <div className="fixed bg-[#191717] h-[1px] left-0 top-0 w-full z-30" />

      {/* Main container */}
      <div className="relative max-w-[1440px] mx-auto" style={{ minHeight: '100vh', paddingBottom: '100px', backgroundColor: 'transparent' }}>

        {/* Left Navigation - Vertical Progress Line */}
        <div 
          ref={navRef}
          className="fixed z-20 w-[2px] cursor-pointer"
          style={{ 
            left: 'calc(50% - 292px)', // Position to left of centered content
            top: `${lineStart}px`,
            height: `${lineEnd - lineStart}px`
          }}
          onMouseEnter={() => {
            setIsHovering(true)
            setShowMenu(true)
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current)
            }
          }}
          onMouseLeave={() => {
            setIsHovering(false)
            // Keep menu visible for a bit after mouse leaves
            hoverTimeoutRef.current = setTimeout(() => {
              setShowMenu(false)
            }, 300)
          }}
        >
          {/* Vertical line background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-[#191717] opacity-20" />
          
          {/* Start cap */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[4px] h-[4px] -translate-y-1/2 rounded-full bg-[#191717] opacity-40" />
          
          {/* End cap */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[4px] h-[4px] translate-y-1/2 rounded-full bg-[#191717] opacity-40" />

          {/* Moving progress indicator (emoticon) */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12px] transition-all duration-300"
            style={{ 
              top: `${scrollProgress * 100}%`,
              fontFamily: 'Manrope',
              fontWeight: 200
            }}
          >
            ☼
          </div>

          {/* Hover menu - shows list of all sections in vertical list */}
          {showMenu && (
            <div className="absolute right-[12px] top-0 flex flex-col gap-[8px] py-[10px]">
              {sections.map((section, index) => {
                const isActive = activeSection === section.id
                
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      scrollToSection(section.id)
                      setShowMenu(true) // Keep menu open after click
                    }}
                    className={`text-right text-[11px] font-extrabold text-[#191717] underline decoration-solid underline-offset-2 hover:text-[#000] transition-all duration-200 whitespace-nowrap w-[100px] ${
                      isActive ? 'opacity-100 font-bold' : 'opacity-70'
                    }`}
                  >
                    {section.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

         {/* Content wrapper - centered, scrollable within line bounds */}
         <div 
           ref={contentRef}
           className="content-wrapper relative pb-[100px] mx-auto max-w-[534px]" 
           style={{ 
             marginTop: `${lineStart}px`, // Position top of wrapper at progress line start (73px)
             paddingTop: '76px', // Space for ASCII star (76px above about section)
             height: lineEnd > lineStart ? `${lineEnd - lineStart}px` : 'auto',
             overflowY: 'auto',
             overflowX: 'hidden',
             backgroundColor: 'transparent'
           }}
         >
          {/* About Section */}
          <section id="about" className="relative mb-[100px] max-w-[534px]">
            {/* Dark mode toggle - positioned relative to about section */}
            <div className="absolute top-[-27px] left-0 z-10">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center justify-center h-[24px] w-[101px] cursor-pointer group"
              >
                <div className="flex-none rotate-[270deg]">
                  <div className="bg-[#d9d9d9] group-hover:bg-[#c0c0c0] h-[101px] rounded-[53px] w-[24px] transition-colors" />
                </div>
                <span className="absolute font-['PT_Serif'] text-[14px] text-black left-[12px] top-[1px]">
                  dark mode {darkMode ? '☼' : '⏾'}
                </span>
              </button>
            </div>

            {/* ASCII Art - positioned relative to about section */}
            <div className="absolute top-[-76px] right-[55px] font-['Manrope'] font-extrabold text-[11px] text-black leading-tight whitespace-pre z-10">
              <p className="mb-0">{`⠀⠀⢸⡿⢦⣄⠀⢀⣠⣴⣶⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ `}</p>
              <p className="mb-0">{`⠀⠀⠘⣷⠀⠉⠛⠛⠉⢰⡇⠀⠀⠘⣷⣦⣾⡇⠀⠀⠀⠀⠀⠀⠀ `}</p>
              <p className="mb-0">{`⠀⢀⣰⠿⠀⠀⠀⠀⠀⢿⡁⠀⢀⣴⣿⣿⣿⣶⡄⠀⠀⠀⠀⠀⠀ `}</p>
              <p className="mb-0">{`⣴⣿⣁⡀⠀⠀⠀⠀⠀⠀⠻⣦⡀⠀⠀⢿⠃⠀⢀⣤⡀⠀⠀⠀⠀ `}</p>
              <p className="mb-0">{`⠀⠈⠉⠛⣿⡀⠀⣰⠟⠛⠛⠛⠛⠀⠀⠀⠀⣠⡾⢻⡇⠀⠀⠀⠀ `}</p>
              <p className="mb-0">{`⠀⠀⠀⠀⠈⣷⣼⠏⠀⠀⠀⢻⣟⠻⠿⢶⡾⠋⠀⢸⡇⠀⠀⠀⠀ `}</p>
              <p className="mb-0">{`⠀⠀⠀⠀⠀⠘⠃⠀⣴⠀⠀⠈⢻⣆⠀⠀⠀⠀⠀⠀⠻⢶⣤⣀⠀ `}</p>
              <p className="mb-0">{`⠀⠀⠀⠀⠀⠘⢷⣾⣿⣤⣄⠀⢈⣿⠀⠀⠀⠀⠀⠀⠀⢀⣉⣿⠿ `}</p>
              <p className="mb-0">{`⠀⠀⠀⠀⠀⢀⣾⠿⣿⡏⠉⢠⣾⠃⠀⠀⠀⠀⠀⢀⣾⠛⠋⠁⠀ `}</p>
              <p className="mb-0">{`⠀⠀⠀⠀⠀⠀⠀⠀⠙⠃⠀⣿⡷⠿⠟⠛⢿⣦⡀⢸⡇⠀⠀⠀⠀ `}</p>
              <p className="mb-0">{`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀  ⠀⠙⢿⣿⠃⠀⠀⠀⠀ `}</p>
              <p>{`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀  ⠀⠉⠀⠀⠀⠀⠀`}</p>
            </div>

            <h1 className="font-['Sofadi_One'] italic text-[40px] text-[#191717] mb-[20px]">
              <span className="font-['Source_Serif_4'] font-normal not-italic">hello, i'm </span>
              <span className="font-['Source_Serif_4'] font-bold italic">freda!</span>
            </h1>
            
            <div className="text-[13px] text-[#191717] leading-relaxed mb-[20px] font-['Manrope']">
              <p className="mb-[20px]">
                <span>I do </span>
                <span className="font-bold">creative</span>
                <span> and </span>
                <span className="font-bold">technical</span>
                <span> work.</span>
              </p>
              <p className="mb-[20px]">
                <span>I'm passionate about the expressive and human aspect of the tech field. </span>
                <span className="font-bold">I get inspired very easily!</span>
                <span> That broadly includes the intersection of design, AI, and computer systems. In my free-time, I indulge in organizing chaotic nerd meetups (</span>
                <span className="underline decoration-solid underline-offset-2">hackathons</span>
                <span>), cooking+baking, listening to music, and finding my next learning fixation. </span>
              </p>
              <p className="mb-[20px]">I study Software Engineering and Business at the University of Western Ontario.</p>
              <p className="mb-[20px]">Currently reworking my GitHub, brainstorming new projects, and recovering from exams :)</p>
            </div>

            {/* Social Links */}
            <div className="flex gap-[27px] items-center mb-[20px]">
              <a 
                href="https://www.linkedin.com/in/freda-z-984442210/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-[30px] h-[30px] hover:opacity-70 transition-opacity cursor-pointer relative z-10 block"
              >
                <img alt="LinkedIn" className="w-full h-full pointer-events-none object-contain" src={imgLinkedin} />
              </a>
              <a 
                href="https://github.com/fredisproductive" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-[31px] h-[30px] hover:opacity-70 transition-opacity cursor-pointer relative z-10 block"
              >
                <img alt="GitHub" className="w-full h-full pointer-events-none object-contain" src={imgGithub} />
              </a>
            </div>
          </section>

          {/* Work Section */}
          <section id="work" className="relative mb-[100px] max-w-[534px]">
            <h2 className="font-['Source_Serif_4'] font-bold italic text-[32px] text-[#191717] mb-[20px]">
              work
            </h2>
            
            <div className="space-y-[20px]">
              <div className="flex flex-col gap-[5px]">
                <div className="flex justify-between items-start">
                  <h3 className="font-['Manrope'] font-bold text-[14px] text-[#191717]">Scotiabank, GWE</h3>
                  <p className="font-['Manrope'] font-extralight text-[12px] text-[#191717] text-right">May 2025 - Aug 2025</p>
                </div>
                <p className="font-['Manrope'] font-normal text-[13px] text-[#191717]">Developed full-stack financial monitoring systems and data pipelines to enhance operational integrity and accelerate issue resolution.</p>
              </div>
              
              <div className="flex flex-col gap-[5px]">
                <div className="flex justify-between items-start">
                  <h3 className="font-['Manrope'] font-bold text-[14px] text-[#191717]">MANTECH Inc.</h3>
                  <p className="font-['Manrope'] font-extralight text-[12px] text-[#191717] text-right">May 2024 - Aug 2024</p>
                </div>
                <p className="font-['Manrope'] font-normal text-[13px] text-[#191717]">Engineered scalable automation software and secure, internationalized platforms to drive product expansion and system reliability.</p>
              </div>
              
              <div className="flex flex-col gap-[5px]">
                <div className="flex justify-between items-start">
                  <h3 className="font-['Manrope'] font-bold text-[14px] text-[#191717]">UW Social and Intelligent Robotics Research Lab (SIRRL)</h3>
                  <p className="font-['Manrope'] font-extralight text-[12px] text-[#191717] text-right">June 2022 - Aug 2022</p>
                </div>
                <p className="font-['Manrope'] font-normal text-[13px] text-[#191717]">Built human-robot interaction software for social robotics platforms, focusing on algorithmic optimization and intelligent systems research.</p>
              </div>
            </div>
          </section>

          {/* Extracurriculars Section */}
          <section id="extracurriculars" className="relative mb-[100px] max-w-[534px]">
            <h2 className="font-['Source_Serif_4'] font-bold italic text-[32px] text-[#191717] mb-[10px]">
              extracurriculars
            </h2>
            <p className="font-['Source_Serif_4'] font-normal italic text-[13px] text-[#191717] mb-[20px]">
              also known as what i pour my heart, soul, blood, sweat, and tears into in my spare time.
            </p>
            
            <div className="space-y-[20px]">
              <div className="flex flex-col gap-[5px]">
                <div className="flex justify-between items-start">
                  <h3 className="font-['Manrope'] font-bold text-[14px] text-[#191717]">SheHacks+ 10 Co-Chair</h3>
                  <p className="font-['Manrope'] font-extralight text-[12px] text-[#191717] text-right">Jan 2025 - Present</p>
                </div>
                <p className="font-['Manrope'] font-normal text-[13px] text-[#191717]">
                  Organizing Canada's largest all-women, non-binary hackathon under the Women+ In Technology Society (WITS+) at Western bubble 🚀
                </p>
                <p className="font-['Manrope'] font-extralight text-[11px] text-[#191717]">
                  Past: Sponsorship Director, SheHacks+9 Director
                </p>
              </div>
              
              <div className="flex flex-col gap-[5px]">
                <div className="flex justify-between items-start">
                  <h3 className="font-['Manrope'] font-bold text-[14px] text-[#191717]">Hack Western 12 Sponsorship Lead</h3>
                  <p className="font-['Manrope'] font-extralight text-[12px] text-[#191717] text-right">Mar 2025 - Present</p>
                </div>
                <p className="font-['Manrope'] font-normal text-[13px] text-[#191717]">
                  Organizing corporate relations for one of Canada's largest student-run hackathons at Western 🐴
                </p>
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section id="projects" className="relative mb-[100px] max-w-[534px]">
            <h2 className="font-['Source_Serif_4'] font-bold italic text-[32px] text-[#191717] mb-[20px]">
              projects
            </h2>
            <p className="font-['Manrope'] font-normal text-[13px] text-[#191717]">
              coming soon...
            </p>
          </section>

        </div>
      </div>

      {/* Footer - positioned 10px from bottom of page */}
      <footer className="fixed left-0 right-0 text-center py-[10px] z-20" style={{ bottom: '10px' }}>
        <p className="font-['PT_Serif'] font-light italic text-[11px] text-[#191717] mb-[5px]">
          <span className="font-bold italic">© 2025 freda zhao </span>
          <span> |  last updated: </span>
          <span className="font-bold italic">12/15/25</span>
        </p>
        <p className="font-['Manrope'] font-light text-[9px] text-[#191717]">
          <span>designed & coded with </span>
          <span className="font-extrabold">♡</span>
        </p>
      </footer>
    </div>
  )
}

export default App


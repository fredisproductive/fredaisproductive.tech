import { useState, useEffect, useRef } from 'react'
import LeaveYourMark from './LeaveYourMark.jsx'

const imgLinkedin = "/assets/linkedin.png"
const imgGithub = "/assets/github.png"
const imgLine11 = "/assets/line11.png"
const imgLine12 = "/assets/line12.png"
const imgLine13 = "/assets/line13.png"
const imgLine14 = "/assets/line14.png"

const NAME_VARIANTS = ['freda!', '赵嘉奕!']

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [activeSection, setActiveSection] = useState('about')
  const [isHovering, setIsHovering] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [lineStart, setLineStart] = useState(96)
  const [lineEnd, setLineEnd] = useState(
    typeof window !== 'undefined' ? window.innerHeight - 50 : 900,
  )
  const [typedName, setTypedName] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [view, setView] = useState(
    typeof window !== 'undefined' && window.location.pathname === '/leave-your-mark'
      ? 'leave'
      : 'home',
  )
  const navRef = useRef(null)
  const contentRef = useRef(null)
  const hoverTimeoutRef = useRef(null)
  const typeIntervalRef = useRef(null)
  const restartTimeoutRef = useRef(null)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    const handlePop = () => {
      const path = window.location.pathname
      setView(path === '/leave-your-mark' ? 'leave' : 'home')
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  const navigateView = (target) => {
    const path = target === 'leave' ? '/leave-your-mark' : '/'
    window.history.pushState({}, '', path)
    setView(target)
  }

  // Natural typing animation for name - randomly types, deletes, pauses
  useEffect(() => {
    let currentText = ''
    let targetText = NAME_VARIANTS[Math.floor(Math.random() * NAME_VARIANTS.length)]
    let queuedTargetText = null
    let isSwitchingName = false
    let hasCorrectedAtFull = false
    let isDeleting = false
    let pauseCount = 0
    let isActive = true
    let isPausingBeforeDelete = false // Track if we're pausing before deleting a character
    // Prevent “flashing” by limiting rapid type/delete alternation
    let modeSwitchesThisCycle = 0
    let actionsSinceLastSwitch = 0
    const MAX_MODE_SWITCHES_PER_CYCLE = 2
    const MIN_ACTIONS_BEFORE_SWITCH = 2
    
    const naturalType = () => {
      if (!isActive) return
      
      // Random chance to pause (10% chance)
      if (pauseCount > 0) {
        pauseCount--
        restartTimeoutRef.current = setTimeout(naturalType, 100 + Math.random() * 200)
        return
      }
      
      // If we've reached the target
      if (currentText === targetText && !isSwitchingName) {
        // Occasionally do a small “correction” even after finishing (delete a bit, then retype),
        // but only once per full-name cycle so it doesn’t loop forever.
        if (!hasCorrectedAtFull && Math.random() < 0.5) {
          hasCorrectedAtFull = true
          isDeleting = true
          isPausingBeforeDelete = false
          pauseCount = 0
          modeSwitchesThisCycle = 0
          actionsSinceLastSwitch = 0
          // Let the normal delete logic handle a short correction; don’t start name-switch yet.
        } else {
          // Wait, then delete one-by-one before typing the next name
          restartTimeoutRef.current = setTimeout(() => {
            queuedTargetText = NAME_VARIANTS[Math.floor(Math.random() * NAME_VARIANTS.length)]
            isSwitchingName = true
            isDeleting = true
            pauseCount = 0
            isPausingBeforeDelete = false
            modeSwitchesThisCycle = 0
            actionsSinceLastSwitch = 0
            // start erasing after a short beat
            restartTimeoutRef.current = setTimeout(naturalType, 180)
          }, 4000)
          return
        }
      }

      // During a name switch, once we've erased everything, start typing the queued name
      if (isSwitchingName && currentText.length === 0) {
        isSwitchingName = false
        isDeleting = false
        isPausingBeforeDelete = false
        modeSwitchesThisCycle = 0
        actionsSinceLastSwitch = 0
        hasCorrectedAtFull = false
        targetText = queuedTargetText ?? NAME_VARIANTS[Math.floor(Math.random() * NAME_VARIANTS.length)]
        queuedTargetText = null
        restartTimeoutRef.current = setTimeout(naturalType, 180)
        return
      }
      
      // Prevent multiple mode switches in the same tick (can cause visible “flashing”)
      let didSwitchModeThisTick = false
      const canSwitchModeNow = () =>
        !isSwitchingName &&
        !didSwitchModeThisTick &&
        actionsSinceLastSwitch >= MIN_ACTIONS_BEFORE_SWITCH &&
        modeSwitchesThisCycle < MAX_MODE_SWITCHES_PER_CYCLE

      // Random chance to start deleting (15% chance if we're typing forward and have at least 2 chars)
      if (
        canSwitchModeNow() &&
        !isDeleting &&
        currentText.length >= 2 &&
        currentText.length < targetText.length &&
        Math.random() < 0.15
      ) {
        isDeleting = true
        isPausingBeforeDelete = false // Reset pause state
        modeSwitchesThisCycle++
        actionsSinceLastSwitch = 0
        pauseCount = Math.floor(Math.random() * 3) // Pause 0-2 cycles before deleting
        didSwitchModeThisTick = true
      }
      
      // Random chance to stop deleting and continue typing (30% chance if deleting)
      if (
        canSwitchModeNow() &&
        isDeleting &&
        currentText.length > 0 &&
        Math.random() < 0.3
      ) {
        isDeleting = false
        isPausingBeforeDelete = false // Reset pause state
        modeSwitchesThisCycle++
        actionsSinceLastSwitch = 0
        pauseCount = Math.floor(Math.random() * 2) // Pause 0-1 cycles before continuing
        didSwitchModeThisTick = true
      }
      
      // Perform action
      if (isDeleting && currentText.length > 0) {
        if (!isPausingBeforeDelete) {
          // First, pause to show the character before deleting it (more natural)
          isPausingBeforeDelete = true
          const pauseDelay = 150 + Math.random() * 200 // Pause before deletion
          restartTimeoutRef.current = setTimeout(naturalType, pauseDelay)
        } else {
          // Now actually delete the character
          currentText = currentText.slice(0, -1)
          setTypedName(currentText)
          actionsSinceLastSwitch++
          isPausingBeforeDelete = false // Reset for next deletion
          // Pause after deletion before deleting next character
          const delay = 200 + Math.random() * 250
          restartTimeoutRef.current = setTimeout(naturalType, delay)
        }
      } else if (currentText.length < targetText.length) {
        // Type a character
        currentText = targetText.slice(0, currentText.length + 1)
        setTypedName(currentText)
        actionsSinceLastSwitch++
        // Random typing speed (faster when closer to completion)
        const baseDelay = 100
        const randomVariation = Math.random() * 100
        const speedBoost = currentText.length > targetText.length * 0.7 ? 0.7 : 1 // Speed up near end
        const delay = (baseDelay + randomVariation) * speedBoost
        restartTimeoutRef.current = setTimeout(naturalType, delay)
      } else {
        // Fallback: if we ever end up here, behave like a normal cycle restart (erase then type next)
        restartTimeoutRef.current = setTimeout(() => {
          queuedTargetText = NAME_VARIANTS[Math.floor(Math.random() * NAME_VARIANTS.length)]
          isSwitchingName = true
          isDeleting = true
          pauseCount = 0
          isPausingBeforeDelete = false
          modeSwitchesThisCycle = 0
          actionsSinceLastSwitch = 0
           hasCorrectedAtFull = false
          restartTimeoutRef.current = setTimeout(naturalType, 180)
        }, 4000)
      }
    }
    
    // Start typing
    naturalType()
    
    return () => {
      // Cleanup on unmount
      isActive = false
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
    }
  }, []) // Run once on mount

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530) // Blink speed
    
    return () => clearInterval(cursorInterval)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'work', 'extracurriculars', 'projects']
      
      // Line starts below top breathing room; ends before bottom of viewport
      const startY = 96
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
          
          sections.forEach((sectionId) => {
            const element = document.getElementById(sectionId)
            if (element) {
              const elementOffsetTop = element.offsetTop
              const elementHeight = element.offsetHeight
              const elementCenter = elementOffsetTop + elementHeight / 2
              const distance = Math.abs(viewportCenter - elementCenter)
              if (distance < minDistance) {
                minDistance = distance
                closestSection = sectionId
              }
            }
          })
          
          foundSection = closestSection
          
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
      const handleScrollWithConstraint = () => {
        if (contentEl.scrollTop < 0) {
          contentEl.scrollTop = 0
          return
        }
        handleScroll()
      }

      contentEl.addEventListener('scroll', handleScrollWithConstraint)
      window.addEventListener('resize', handleScroll)
      handleScroll()
      return () => {
        contentEl.removeEventListener('scroll', handleScrollWithConstraint)
        window.removeEventListener('resize', handleScroll)
      }
    }
  }, [])

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    const contentEl = contentRef.current
    if (element && contentEl) {
      if (id === 'about') {
        // For "about" section, align ASCII star top with progress bar start
        // Content wrapper has padding-top matching the star offset so scrollTop = 0 aligns the layout
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
          // Content wrapper top is at progress line start (lineStart from viewport)
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

  if (view === 'leave') {
    return (
      <div
        className="dot-pattern relative w-full min-h-screen"
        style={{ margin: 0, padding: 0 }}
      >
        <LeaveYourMark onBack={() => navigateView('home')} />
      </div>
    )
  }

  return (
    <div 
      className={`dot-pattern relative w-full ${darkMode ? 'dark' : ''}`}
      style={{ 
        minHeight: '100vh',
        backgroundColor: darkMode ? '#191717' : undefined,
        margin: 0,
        paddingTop: 0,
        paddingBottom: '100px',
        paddingLeft: 0,
        paddingRight: 0,
        top: 0,
        left: 0
      }}
    >
      {/* Top border */}
      <div className={`fixed h-[1px] left-0 top-0 w-full z-30 ${darkMode ? 'bg-[#E7E7E7]' : 'bg-[#191717]'}`} />

      {/* Mobile Navigation Menu - Only visible on mobile */}
      <div className="md:hidden fixed top-4 right-4 z-30">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-[#E7E7E7] text-[#191717]' : 'bg-[#191717] text-[#E7E7E7]'}`}
          >
            <span className="text-lg">{showMenu ? '✕' : '☰'}</span>
          </button>
          {showMenu && (
            <div className={`absolute top-12 right-0 rounded-lg shadow-lg p-4 min-w-[150px] ${darkMode ? 'bg-[#191717]' : 'bg-white'}`}>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    scrollToSection(section.id)
                    setShowMenu(false)
                  }}
                  className={`block w-full text-left py-2 text-sm font-bold underline decoration-solid underline-offset-2 ${
                    activeSection === section.id
                      ? darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'
                      : darkMode ? 'text-[#E7E7E7] opacity-70' : 'text-[#191717] opacity-70'
                  }`}
                >
                  {section.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  navigateView('leave')
                  setShowMenu(false)
                }}
                className={`block w-full text-left py-2 text-sm font-bold underline decoration-solid underline-offset-2 ${
                  darkMode ? 'text-[#E7E7E7] opacity-70' : 'text-[#191717] opacity-70'
                }`}
              >
                leave your mark
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main container */}
      <div className="relative max-w-[1440px] mx-auto" style={{ minHeight: '120vh', paddingBottom: '100px', backgroundColor: 'transparent' }}>

        {/* Left Navigation - Vertical Progress Line */}
        <div 
          ref={navRef}
          className="hidden md:block fixed z-20 w-[2px] cursor-pointer"
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
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full opacity-20 ${darkMode ? 'bg-[#E7E7E7]' : 'bg-[#191717]'}`} />
          
          {/* Start cap */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[4px] h-[4px] -translate-y-1/2 rounded-full opacity-40 ${darkMode ? 'bg-[#E7E7E7]' : 'bg-[#191717]'}`} />
          
          {/* End cap */}
          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[4px] h-[4px] translate-y-1/2 rounded-full opacity-40 ${darkMode ? 'bg-[#E7E7E7]' : 'bg-[#191717]'}`} />

          {/* Moving progress indicator (emoticon) */}
          <div 
            className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12px] transition-all duration-300 ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}
            style={{ 
              top: `${scrollProgress * 100}%`,
              fontFamily: 'Manrope',
              fontWeight: 200
            }}
          >
            {darkMode ? '☆' : '☼'}
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
                    className={`text-right text-[11px] font-extrabold underline decoration-solid underline-offset-2 transition-all duration-200 whitespace-nowrap w-[100px] outline-none focus:outline-none select-none ${
                      darkMode 
                        ? 'text-[#E7E7E7] hover:text-[#ffffff] hover:opacity-100' 
                        : 'text-[#191717] hover:text-[#000000] hover:opacity-100'
                    } ${
                      isActive ? 'opacity-100 font-bold' : 'opacity-70'
                    }`}
                  >
                    {section.label}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => {
                  navigateView('leave')
                  setShowMenu(true)
                }}
                className={`text-right text-[11px] font-extrabold underline decoration-solid underline-offset-2 transition-all duration-200 whitespace-nowrap w-[100px] outline-none focus:outline-none select-none ${
                  darkMode
                    ? 'text-[#E7E7E7] hover:text-[#ffffff] hover:opacity-100'
                    : 'text-[#191717] hover:text-[#000000] hover:opacity-100'
                } opacity-70`}
              >
                leave your mark
              </button>
            </div>
          )}
        </div>

         {/* Top of this box = top of the fixed vertical sidebar line (lineStart). No extra paddingTop — stars align to this edge. */}
         <div 
           ref={contentRef}
           className="content-wrapper relative pb-[100px] mx-auto max-w-[534px] px-4 md:px-0" 
           style={{ 
             marginTop: `${lineStart}px`,
             paddingTop: 0,
             height: lineEnd > lineStart ? `${lineEnd - lineStart}px` : 'auto',
             overflowY: 'auto',
             overflowX: 'hidden',
             backgroundColor: 'transparent'
           }}
         >
          {/* About Section */}
          <section id="about" className="relative mb-[30px] max-w-[534px] pt-[min(92px,18vw)]">
            {/* Dark/Light mode toggle */}
            <div className="absolute top-0 left-0 z-10">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center justify-center h-[24px] w-[101px] cursor-pointer group outline-none focus:outline-none"
              >
                <div className="flex-none rotate-[270deg]">
                  <div className={`h-[101px] rounded-[53px] w-[24px] transition-colors ${
                    darkMode 
                      ? 'bg-[#d9d9d9] group-hover:bg-[#c0c0c0]' 
                      : 'bg-[#191717] group-hover:bg-[#2a2a2a]'
                  }`} />
                </div>
                <span className={`absolute font-['PT_Serif'] text-[12px] md:text-[14px] left-[12px] top-[1px] ${darkMode ? 'text-black' : 'text-white'}`}>
                  {darkMode ? 'light mode ☼' : 'dark mode ⏾'}
                </span>
              </button>
            </div>

            {/* ASCII — top of block lines up with top of sidebar / content box (section top). Horizontal: right-[40px]. */}
            <div className={`absolute top-0 right-[40px] font-['Manrope'] font-extrabold text-[8px] md:text-[11px] leading-tight whitespace-pre z-[5] hidden sm:block ${darkMode ? 'text-[#E7E7E7]' : 'text-black'}`}>
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

            <h1 className={`font-['Sofadi_One'] italic text-[32px] md:text-[40px] mb-[5px] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>
              <span className="font-['Source_Serif_4'] font-normal not-italic">hello, i'm </span>
              <span className="font-['Source_Serif_4'] font-bold italic">
                {typedName}
                <span className={showCursor ? 'opacity-100' : 'opacity-0'}>|</span>
              </span>
            </h1>
            
            <div className={`text-[12px] md:text-[13px] leading-relaxed mb-[20px] font-['Manrope'] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>
              <p className="mb-[10px]">
                <span>I do </span>
                <span className="font-bold">creative</span>
                <span> and </span>
                <span className="font-bold">technical</span>
                <span> work.</span>
              </p>
              <p className="mb-[10px]">
                <span>I study </span>
                <span className="font-bold">Software Engineering</span>
                <span> and Business at the University of Western Ontario.</span>
                </p>
              <p className="mb-[10px]">
                <span>I'm passionate about the expressive and human aspect of the tech field. </span>
                <span className="font-bold">I get inspired very easily!</span>
                <span> That broadly includes the intersection of design, AI, and computer systems. In my free-time, I indulge in organizing chaotic nerd meetups (hackathons), cooking+baking, listening to music, and finding my next learning fixation. </span>
              </p>
              <p className="mb-[-5px]">Currently: reworking my GitHub, brainstorming projects, and recovering from exams :)</p>
            </div>

            {/* Social links + leave your mark — space below pushes work & rest of page down */}
            <div className="flex flex-col gap-[10px] mb-[32px]">
              <div className="flex gap-[20px] items-center">
              <a 
                href="https://www.linkedin.com/in/freda-z-984442210/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-[30px] h-[30px] hover:opacity-70 transition-opacity cursor-pointer relative z-10 block outline-none focus:outline-none"
              >
                <img 
                  alt="LinkedIn" 
                  className={`w-full h-full pointer-events-none object-contain ${darkMode ? 'brightness-0 invert' : ''}`} 
                  src={imgLinkedin} 
                />
              </a>
              <a 
                href="https://github.com/fredisproductive" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-[31px] h-[30px] hover:opacity-70 transition-opacity cursor-pointer relative z-10 block outline-none focus:outline-none"
              >
                <img 
                  alt="GitHub" 
                  className={`w-full h-full pointer-events-none object-contain ${darkMode ? 'brightness-0 invert' : ''}`} 
                  src={imgGithub} 
                />
              </a>
            </div>

            <button
              type="button"
              onClick={() => navigateView('leave')}
              className="mt-[8px] text-[11px] font-['Manrope'] underline decoration-solid underline-offset-2 opacity-70 hover:opacity-100"
            >
              leave your mark ↗
            </button>
            </div>
          </section>

          {/* Work Section */}
          <section id="work" className="relative mb-[35px] max-w-[534px]">
            <h2 className={`font-['Source_Serif_4'] font-bold italic text-[28px] md:text-[32px] mb-[5px] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>
              work
            </h2>
            
            <div className="space-y-[10px]">
              <div className="flex flex-col gap-[5px]">
                <div className="flex justify-between items-start">
                  <h3 className={`font-['Manrope'] font-bold text-[13px] md:text-[14px] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>
                    <a 
                      href="https://globalwealth.scotiabank.com/en/home.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:opacity-70 transition-opacity underline decoration-solid underline-offset-2"
                    >
                      Scotiabank, GWE
                    </a>
                  </h3>
                  <p className={`font-['Manrope'] font-extralight text-[11px] md:text-[12px] text-right ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>May 2025 - Aug 2025</p>
                </div>
                <p className={`font-['Manrope'] font-normal text-[12px] md:text-[13px] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>Developed full-stack financial monitoring systems and data pipelines to enhance operational integrity and accelerate issue resolution.</p>
              </div>
              
              <div className="flex flex-col gap-[5px]">
                <div className="flex justify-between items-start">
                  <h3 className={`font-['Manrope'] font-bold text-[13px] md:text-[14px] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>
                    <a 
                      href="https://mantech-inc.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:opacity-70 transition-opacity underline decoration-solid underline-offset-2"
                    >
                      MANTECH Inc.
                    </a>
                  </h3>
                  <p className={`font-['Manrope'] font-extralight text-[11px] md:text-[12px] text-right ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>May 2024 - Aug 2024</p>
                </div>
                <p className={`font-['Manrope'] font-normal text-[12px] md:text-[13px] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>Engineered scalable automation software and secure, internationalized platforms to drive product expansion and system reliability.</p>
              </div>
              
              <div className="flex flex-col gap-[5px]">
                <div className="flex justify-between items-start">
                  <h3 className={`font-['Manrope'] font-bold text-[13px] md:text-[14px] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>
                    <a 
                      href="https://uwaterloo.ca/social-intelligent-robotics-research-lab/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:opacity-70 transition-opacity underline decoration-solid underline-offset-2"
                    >
                      UW Social and Intelligent Robotics Research Lab (SIRRL)
                    </a>
                  </h3>
                  <p className={`font-['Manrope'] font-extralight text-[11px] md:text-[12px] text-right ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>June 2022 - Aug 2022</p>
                </div>
                <p className={`font-['Manrope'] font-normal text-[12px] md:text-[13px] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>Built human-robot interaction software for social robotics platforms, focusing on algorithmic optimization and intelligent systems research.</p>
              </div>
            </div>
          </section>

          {/* Extracurriculars Section */}
          <section id="extracurriculars" className="relative mb-[30px] max-w-[534px]">
            <h2 className={`font-['Source_Serif_4'] font-bold italic text-[28px] md:text-[32px] mb-[0px] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>
              extracurriculars
            </h2>
            <p className={`font-['Source_Serif_4'] font-normal italic text-[12px] md:text-[13px] mb-[12px] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>
              also known as what i pour my heart, soul, blood, sweat, and tears into in my spare time.
            </p>
            
            <div className="space-y-[10px]">
              <div className="flex flex-col gap-[5px]">
                <div className="flex justify-between items-start">
                  <h3 className={`font-['Manrope'] font-bold text-[13px] md:text-[14px] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>
                    <a 
                      href="https://www.shehacks.ca/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:opacity-70 transition-opacity underline decoration-solid underline-offset-2"
                    >
                      SheHacks+ 10 Co-Chair
                    </a>
                  </h3>
                  <p className={`font-['Manrope'] font-extralight text-[11px] md:text-[12px] text-right ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>Jan 2025 - Apr 2026</p>
                </div>
                <p className={`font-['Manrope'] font-normal text-[12px] md:text-[13px] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>
                  Organizing Canada's largest all-women, non-binary hackathon under the Women+ In Technology Society (WITS+) bubble at Western 🚀
                </p>
                <p className={`font-['Manrope'] font-extralight text-[10px] md:text-[11px] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>
                  Past: Sponsorship Director, SheHacks+9 Director
                </p>
              </div>
              
              <div className="flex flex-col gap-[5px] mt-[30px]">
                <div className="flex justify-between items-start">
                  <h3 className={`font-['Manrope'] font-bold text-[13px] md:text-[14px] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>
                    <a 
                      href="https://www.hackwestern.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:opacity-70 transition-opacity underline decoration-solid underline-offset-2"
                    >
                      Hack Western 12 Sponsorship Lead
                    </a>
                  </h3>
                  <p className={`font-['Manrope'] font-extralight text-[11px] md:text-[12px] text-right ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>Mar 2025 - Apr 2026</p>
                </div>
                <p className={`font-['Manrope'] font-normal text-[12px] md:text-[13px] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>
                  Organizing corporate relations for one of Canada's largest student-run hackathons at Western 🐴
                </p>
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section id="projects" className="relative mb-[30px] max-w-[534px]">
            <h2 className={`font-['Source_Serif_4'] font-bold italic text-[28px] md:text-[32px] mb-[8px] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>
              projects
            </h2>
            <p className={`font-['Manrope'] font-normal text-[12px] md:text-[13px] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>
              coming soon...
            </p>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="fixed left-0 right-0 text-center py-[10px] z-20 px-4" style={{ bottom: '10px' }}>
        {/* <p className={`font-['PT_Serif'] font-light italic text-[11px] mb-[5px] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>
          <span className="font-bold italic">© 2025 freda zhao </span>
        </p> */}
        <p className={`font-['Manrope'] font-light text-[10px] md:text-[11px] ${darkMode ? 'text-[#E7E7E7]' : 'text-[#191717]'}`}>
          <span>designed & coded with </span>
          <span className="font-extrabold">♡</span>
          <span> |  last updated: </span>
          <span className="font italic">04/18/26</span>
        </p>
      </footer>
    </div>
  )
}

export default App


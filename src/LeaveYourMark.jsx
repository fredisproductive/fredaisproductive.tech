import { useEffect, useRef, useState } from 'react'

import baseImg from './assets/leave-your-mark/base.png'
import carriageImg from './assets/leave-your-mark/carriage.png'
import cardScribbleBack from './assets/leave-your-mark/card-scribble-back.png'
import cardScribbleFront from './assets/leave-your-mark/card-scribble-front.png'
import paperUnderlineImg from './assets/leave-your-mark/paper-underline.png'

/** Figma frame 803:752 — desktop artboard width */
const ARTBOARD_W = 1200
const PLACEHOLDER_TEXT = 'live love laugh lol'

const MAX_COLS = 52
/** Max number of typed lines on the paper (Enter adds a line). */
const MAX_TEXT_LINES = 7
const LINE_HEIGHT_PX = 14
const CHAR_WIDTH_PX = 10
/** Paper (fixed size) vs typewriter art (scaled independently) */
const PAPER_LEFT = 161.69
const PAPER_W = 394.577
const PAPER_H = 474.337
/** Only applied to base + carriage PNGs, not the paper */
const TYPEWRITER_SCALE = 1.22
const BASE_TOP_IN_GROUP = 376 - 157
const TYPEWRITER_ORIGIN_X = PAPER_LEFT + PAPER_W / 2
const TYPEWRITER_ORIGIN_Y = PAPER_H

const emptyLine = () => []

function lineToString(segments) {
  return segments.map((s) => s.ch).join('')
}

function appendCharToLines(lines, cursor, ch, color) {
  const nextLines = [...lines]
  while (nextLines.length <= cursor.line) {
    nextLines.push(emptyLine())
  }

  const current = [...nextLines[cursor.line]]
  if (cursor.col >= MAX_COLS) {
    return { lines: nextLines, cursor }
  }

  current[cursor.col] = { ch, color }
  nextLines[cursor.line] = current

  return {
    lines: nextLines,
    cursor: { line: cursor.line, col: cursor.col + 1 },
  }
}

function formatDateMdY(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${mm}/${dd}/${yyyy}`
}

export default function LeaveYourMark({ onBack }) {
  const [authorName, setAuthorName] = useState('mark lee')
  const [now, setNow] = useState(() => new Date())
  const [paperStarted, setPaperStarted] = useState(false)
  const [lines, setLines] = useState([emptyLine()])
  const [cursor, setCursor] = useState({ line: 0, col: 0 })
  const [snapshotsOpen, setSnapshotsOpen] = useState(false)
  const [snapshots, setSnapshots] = useState([])
  const [typingVersion, setTypingVersion] = useState(0)

  const rootRef = useRef(null)
  const paperScrollRef = useRef(null)
  const nameInputRef = useRef(null)

  const inkColor = '#191717'
  const baseOffsetX = 80

  useEffect(() => {
    const tick = () => setNow(new Date())
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (rootRef.current && !snapshotsOpen) {
      rootRef.current.focus()
    }
  }, [snapshotsOpen])

  useEffect(() => {
    if (paperScrollRef.current) {
      paperScrollRef.current.scrollTop = paperScrollRef.current.scrollHeight
    }
  }, [cursor, typingVersion, paperStarted])

  const carriageX = baseOffsetX - cursor.col * CHAR_WIDTH_PX

  const handleTakeSnapshot = () => {
    let flatLines = lines.map((ln) => lineToString(ln))
    if (!paperStarted) {
      flatLines = [PLACEHOLDER_TEXT]
    }
    const start = Math.max(0, flatLines.length - 15)
    const slice = flatLines.slice(start)
    const ts = new Date()
    setSnapshots((prev) => [
      ...prev,
      {
        id: `${ts.getTime()}-${prev.length}`,
        at: ts.toISOString(),
        name: authorName.trim() || 'anon',
        lines: slice,
      },
    ])
    setSnapshotsOpen(true)
  }

  const advanceLine = () => {
    setPaperStarted(true)
    setCursor((c) => {
      if (c.line >= MAX_TEXT_LINES - 1) {
        return c
      }
      const nextLine = c.line + 1
      setLines((prev) => {
        const next = [...prev]
        while (next.length <= nextLine) {
          next.push(emptyLine())
        }
        return next
      })
      setTypingVersion((v) => v + 1)
      return { line: nextLine, col: 0 }
    })
  }

  const handleKeyDown = (event) => {
    if (snapshotsOpen) return
    if (event.target === nameInputRef.current) return

    if (event.key === 'Tab') {
      event.preventDefault()
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      advanceLine()
      return
    }

    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault()
      const ch = event.key === '\n' ? '' : event.key
      if (!ch || ch === '\r') return

      const printable = ch === ' ' || (ch >= '!' && ch <= '~')
      if (!printable) return

      let nextLines = lines
      let nextCursor = cursor

      if (!paperStarted) {
        setPaperStarted(true)
        nextLines = [emptyLine()]
        const appended = appendCharToLines(
          nextLines,
          { line: 0, col: 0 },
          ch,
          inkColor,
        )
        nextLines = appended.lines
        nextCursor = appended.cursor
      } else {
        const appended = appendCharToLines(lines, cursor, ch, inkColor)
        nextLines = appended.lines
        nextCursor = appended.cursor
      }

      setLines(nextLines)
      setCursor(nextCursor)
      setTypingVersion((v) => v + 1)
    }
  }

  const formattedTimestamp = (iso) => {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const mono = "'Geist Mono', ui-monospace, monospace"

  return (
    <div className="relative w-full min-h-screen overflow-x-auto overflow-y-visible">
      {/* Full Figma width — maxWidth:100% was shrinking the artboard and clipping the typewriter */}
      <div className="mx-auto w-full max-w-[min(100%,1240px)] px-4 pb-24 pt-16 md:pt-20">
        <div
          className="relative mx-auto overflow-x-auto overflow-y-visible"
          style={{
            width: ARTBOARD_W,
            minWidth: ARTBOARD_W,
            minHeight: 1120,
          }}
        >
          <div
            ref={rootRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="relative mx-auto outline-none"
            style={{
              width: ARTBOARD_W,
              minHeight: 1120,
              color: '#000',
            }}
          >
            <button
              type="button"
              onClick={onBack}
              className="absolute left-[40px] top-[8px] z-[100] text-[11px] font-['Manrope'] underline decoration-solid underline-offset-2 opacity-70 hover:opacity-100"
            >
              ← back to portfolio
            </button>

            <h1 className="absolute left-[106px] top-[229px] max-w-[calc(100%-120px)] font-['Source_Serif_4'] text-[24px] italic leading-none text-black">
              <span className="inline-block whitespace-nowrap">
                <span>leave your </span>
                <span className="font-bold">mark</span>
                <span>{' ⋆｡𖦹°‧★ !'}</span>
              </span>
            </h1>

            <div className="absolute left-[105px] top-[272px] h-[53px] w-[387px] max-w-[calc(100%-40px)] font-['Manrope'] text-[14px] leading-normal text-black">
              <p className="mb-0">
                write something out for me/anyone to read!{' '}
              </p>
              <p>
                <span>but don&apos;t try anything </span>
                <span className="font-bold">fishy</span>
                <span>...it won&apos;t work...</span>
                <span className="font-bold">i warned you</span>
                <span>...</span>
              </p>
            </div>

            <div className="absolute left-[180.71px] top-[347px] h-[130.924px] w-[100.531px] rounded-[5px] bg-[#f4f4f4]" />
            <div
              className="absolute left-[196.4px] top-[376.96px] h-[30.803px] w-[74.401px]"
              aria-hidden
            >
              <img
                alt=""
                src={cardScribbleBack}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="absolute left-[102px] top-[362.59px] flex h-[149.914px] w-[126.994px] items-center justify-center">
              <div className="flex-none rotate-[-12.78deg]">
                <div className="h-[130.924px] w-[100.531px] rounded-[5px] border border-[rgba(0,0,0,0.06)] bg-[#f4f4f4]" />
              </div>
            </div>
            <div className="absolute left-[122.92px] top-[402.48px] h-[43.524px] w-[75.076px]">
              <img
                alt=""
                src={cardScribbleFront}
                className="h-full w-full object-contain"
              />
            </div>

            <button
              type="button"
              onClick={() => setSnapshotsOpen(true)}
              className="absolute left-[131px] top-[523px] whitespace-pre text-left font-['Source_Serif_4'] text-[12px] italic leading-none text-black no-underline decoration-solid underline-offset-2 hover:underline"
            >
              <span>view other </span>
              <span className="font-bold">marks </span>
              <span className="font-bold">{` *ੈ✩‧₊˚:`}</span>
              <span className="font-bold">{` >`}</span>
            </button>

            {/* Paper + typewriter share this anchor; only the paper translates horizontally */}
            <div className="absolute left-[449px] top-[157px] z-[30]">
              {/* Fixed typewriter — scaled here only; does not move with typing */}
              <div
                className="pointer-events-none absolute left-0 top-0"
                style={{
                  width: Math.ceil(PAPER_LEFT + PAPER_W + 160),
                  height: 720,
                  zIndex: 40,
                  transform: `scale(${TYPEWRITER_SCALE})`,
                  transformOrigin: `${TYPEWRITER_ORIGIN_X}px ${TYPEWRITER_ORIGIN_Y}px`,
                }}
              >
                <img
                  alt=""
                  src={carriageImg}
                  className="absolute z-[1] h-auto max-w-none select-none"
                  style={{
                    left: PAPER_LEFT,
                    top: 168,
                    width: PAPER_W,
                  }}
                  draggable={false}
                />
                <img
                  alt=""
                  src={baseImg}
                  className="absolute z-0 h-auto max-w-none select-none"
                  style={{
                    left: PAPER_LEFT,
                    top: BASE_TOP_IN_GROUP,
                    width: PAPER_W,
                  }}
                  draggable={false}
                />
              </div>

              <div
                className="absolute top-0 z-[50] overflow-hidden rounded-[5px]"
                style={{
                  left: PAPER_LEFT,
                  width: PAPER_W,
                  height: PAPER_H,
                  transform: `translateX(${carriageX}px)`,
                  transition: 'transform 120ms ease-out',
                  backgroundColor: '#fafafa',
                  border: '1px solid rgba(0,0,0,0.14)',
                  boxShadow:
                    'inset 0 0 0 1px rgba(255,255,255,0.75), 0 2px 10px rgba(0,0,0,0.07)',
                }}
                onClick={() => rootRef.current?.focus()}
                role="presentation"
              >
                <div
                  className="absolute left-[24.31px] right-[24px] top-[23px] flex items-start justify-between gap-2"
                  style={{ fontFamily: mono, fontSize: 10 }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTakeSnapshot()
                    }}
                    className="font-bold text-black underline decoration-solid underline-offset-2"
                  >
                    done!
                  </button>
                  <p className="m-0 shrink-0 text-black">
                    <span className="font-bold">date:</span>{' '}
                    <span className="font-normal tabular-nums">
                      {formatDateMdY(now)}
                    </span>
                  </p>
                  <label
                    className="m-0 flex max-w-[120px] items-baseline justify-end gap-0.5 text-black"
                    style={{ fontFamily: mono, fontSize: 10 }}
                  >
                    <span className="shrink-0 font-bold">name:</span>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="min-w-0 flex-1 border-0 bg-transparent p-0 font-normal text-black outline-none"
                      style={{ fontFamily: mono, fontSize: 10 }}
                      maxLength={48}
                      spellCheck={false}
                      aria-label="Your name"
                    />
                  </label>
                </div>

                <p
                  className="absolute left-[27.31px] top-[87px] m-0 font-bold leading-none text-black"
                  style={{ fontFamily: mono, fontSize: 12 }}
                >
                  start your thought here:
                </p>

                <div
                  className="pointer-events-none absolute left-[24px] right-[24px] top-[179px] z-[2] w-auto"
                  style={{ height: 33 }}
                >
                  <img
                    alt=""
                    src={paperUnderlineImg}
                    className="block h-full w-full max-w-none object-fill opacity-90"
                    draggable={false}
                  />
                </div>

                <div
                  ref={paperScrollRef}
                  className="scrollbar-none absolute left-[27.31px] right-[26px] top-[118px] z-[3] overflow-y-auto"
                  style={{ bottom: 22 }}
                  onClick={() => rootRef.current?.focus()}
                >
                  <div
                    style={{
                      position: 'relative',
                      minHeight: MAX_TEXT_LINES * LINE_HEIGHT_PX + 24,
                    }}
                  >
                    {!paperStarted && (
                      <p
                        className="m-0 font-normal text-black/55"
                        style={{
                          fontFamily: mono,
                          fontSize: 10,
                          lineHeight: `${LINE_HEIGHT_PX}px`,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {PLACEHOLDER_TEXT}
                      </p>
                    )}
                    {paperStarted &&
                      lines.map((segments, idx) => (
                        <div
                          key={idx}
                          style={{
                            height: LINE_HEIGHT_PX,
                            fontFamily: mono,
                            fontSize: 10,
                            lineHeight: `${LINE_HEIGHT_PX}px`,
                            whiteSpace: 'pre',
                            display: 'flex',
                            color: '#000',
                          }}
                        >
                          {segments.length === 0 ? (
                            <span>&nbsp;</span>
                          ) : (
                            segments.map((seg, i) => (
                              <span key={i} style={{ color: seg.color }}>
                                {seg.ch}
                              </span>
                            ))
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="absolute left-[867px] top-[849px] whitespace-nowrap font-['Source_Serif_4'] text-[12px] italic text-black">
              <span>typewriter graphic and concept from </span>
              <span className="font-bold not-italic">@designteamofone</span>
            </p>
          </div>
        </div>
      </div>

      {snapshotsOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-black/25"
            aria-label="Close gallery"
            onClick={() => setSnapshotsOpen(false)}
          />
          <div className="relative mx-4 max-h-[min(80vh,720px)] w-full max-w-3xl overflow-hidden rounded-3xl border border-[#e5e7eb] bg-[#f3f4f6] shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <div>
                <h2 className="font-['Source_Serif_4'] text-[20px] font-bold italic">
                  mark gallery
                </h2>
                <p className="font-['Manrope'] text-[12px] text-[#4b5563]">
                  check out other masterpieces, journey mercies (~˘▾˘)~
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSnapshotsOpen(false)}
                className="text-[11px] font-['Manrope'] underline decoration-solid underline-offset-2 opacity-70 hover:opacity-100"
              >
                close
              </button>
            </div>
            <div
              className="px-6 pb-6"
              style={{ maxHeight: '60vh', overflowY: 'auto' }}
            >
              {snapshots.length === 0 && (
                <p className="font-['Manrope'] text-[12px] text-[#6b7280]">
                  no snapshots yet — press done! on the paper.
                </p>
              )}
              {snapshots.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {snapshots
                    .slice()
                    .reverse()
                    .map((snap) => (
                      <div
                        key={snap.id}
                        className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-[#e5e7eb] bg-white px-3 py-2 shadow-sm"
                      >
                        <div className="flex-1">
                          <p className="mb-1 font-['Manrope'] text-[9px] text-[#6b7280]">
                            {snap.name}
                          </p>
                          {snap.lines.map((ln, idx) => (
                            <p
                              key={idx}
                              className="font-['PT_Serif'] text-[10px] leading-snug text-[#111827] whitespace-pre-wrap"
                            >
                              {ln || ' '}
                            </p>
                          ))}
                        </div>
                        <p className="mt-2 font-['Manrope'] text-[9px] text-[#6b7280]">
                          {formattedTimestamp(snap.at)}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-none { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

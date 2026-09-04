import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from './lib/store'
import SplashScreen from './components/SplashScreen'
import DemoOverlay from './components/DemoOverlay'
import TabBar from './components/TabBar'
import ScanPage from './pages/ScanPage'
import DocsPage from './pages/DocsPage'
import ChatPage from './pages/ChatPage'
import ScorePage from './pages/ScorePage'
import SettingsPage from './pages/SettingsPage'
import ToolsPage from './pages/ToolsPage'
import ScannerOverlay from './components/ScannerOverlay'
import Toast from './components/Toast'
import HumanoidDock from './components/HumanoidDock'
import CustomCursor from './components/CustomCursor'
import AmbientBg from './components/AmbientBg'

const pages = {
  scan: ScanPage,
  docs: DocsPage,
  chat: ChatPage,
  score: ScorePage,
  tools: ToolsPage,
  settings: SettingsPage,
}

export default function App() {
  const { currentPage, showSplash, setShowSplash, scanning, scanResults } = useStore()
  const [pageKey, setPageKey] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2800)
    return () => clearTimeout(t)
  }, [])

  // Force re-mount on page change for entrance animation
  useEffect(() => {
    setPageKey(prev => prev + 1)
  }, [currentPage])

  const PageComponent = pages[currentPage] || ScanPage

  return (
    <>
      <CustomCursor />
      <AmbientBg />

      {/* Splash */}
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>

      {/* Scanner overlay */}
      <AnimatePresence>
        {scanning && <ScannerOverlay key="scanner" />}
      </AnimatePresence>

      <DemoOverlay />
      <Toast />

      {/* Main content */}
      {!showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          style={{
            position: 'relative',
            zIndex: 1,
            minHeight: '100dvh',
            paddingBottom: 'calc(var(--tab-h) + var(--safe-b) + 80px)',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pageKey}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
              transition={{
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <PageComponent />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {!showSplash && <TabBar />}

      {!showSplash && (
        <HumanoidDock
          scanState={scanning ? 'scanning' : 'idle'}
          findings={scanResults?.findings || []}
        />
      )}
    </>
  )
}

import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import Pricing from './components/Pricing'
import InstallOS from './components/InstallOS'
import Footer from './components/Footer'
import './index.css'

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
        <InstallOS />
      </main>
      <Footer />
    </>
  )
}

export default App

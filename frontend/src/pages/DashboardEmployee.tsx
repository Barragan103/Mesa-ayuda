import React from 'react'
import { CombinedSlider } from '../components/CombinedSlider'

export default function DashboardEmployee() {
  return (
    <div>
      <CombinedSlider interval={8000} />
      {/* …el resto de tu dashboard… */}
    </div>
  )
}

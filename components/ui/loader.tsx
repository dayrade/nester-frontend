'use client'

import React from 'react'
import './loader.css'

interface LoaderProps {
  className?: string
  text?: string
}

export const Loader: React.FC<LoaderProps> = ({ 
  className = '', 
  text = 'NESTER' 
}) => {
  return (
    <div className={`loader ${className}`}>
      <span>{text}</span>
      <span>{text}</span>
    </div>
  )
}

export default Loader
"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

interface WhatsAppButtonProps {
  phoneNumber?: string
  message?: string
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
}

export function WhatsAppButton({ 
  phoneNumber = "+584121234567", 
  message = "Hola! Me interesa participar en las rifas de ElevenRifas",
  position = "bottom-right"
}: WhatsAppButtonProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Mostrar el botón después de un pequeño delay para mejor UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2000) // 2 segundos después de cargar la página

    return () => clearTimeout(timer)
  }, [])

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6", 
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6"
  }

  if (!isVisible) return null

  return (
    <>
      {/* Botón principal */}
      <button
        onClick={handleClick}
        className={`
          fixed ${positionClasses[position]} z-50
          w-12 h-12 rounded-full
          bg-green-500 hover:bg-green-600
          shadow-lg hover:shadow-xl
          transition-all duration-300 ease-in-out
          transform hover:scale-110
          group flex items-center justify-center
        `}
        aria-label="Contactar por WhatsApp"
      >
        <Image
          src="/WhatsApp_icon.png"
          alt="WhatsApp"
          width={32}
          height={32}
          className="object-contain"
        />
      </button>

      {/* Tooltip */}
      <div className={`
        fixed ${positionClasses[position]} z-40
        ${position.includes('right') ? 'right-20' : 'left-20'}
        ${position.includes('bottom') ? 'bottom-6' : 'top-6'}
        bg-gray-900 text-white text-sm px-3 py-2 rounded-lg
        shadow-lg opacity-0 group-hover:opacity-100
        transition-opacity duration-300
        pointer-events-none
        whitespace-nowrap
      `}>
        ¡Escríbenos por WhatsApp!
        <div className={`
          absolute top-1/2 transform -translate-y-1/2
          ${position.includes('right') ? '-right-1' : '-left-1'}
          w-2 h-2 bg-gray-900 rotate-45
        `}></div>
      </div>

    </>
  )
}

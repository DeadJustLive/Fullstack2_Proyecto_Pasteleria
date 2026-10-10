import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-pink-600 mb-4">
          ¡Pastelería App! 🍰
        </h1>
        <p className="text-gray-600 mb-6">
          El frontend ha sido configurado con React, TypeScript y Tailwind CSS.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition">
            Admin
          </button>
          <button className="px-4 py-2 border border-pink-600 text-pink-600 rounded hover:bg-pink-50 transition">
            Cliente
          </button>
        </div>
      </div>
    </div>
  )
}

export default App

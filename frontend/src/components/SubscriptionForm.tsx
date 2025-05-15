// import React, { useState, FormEvent } from 'react'

// export function SubscriptionForm() {
//   const [email, setEmail] = useState('')
//   const [city, setCity] = useState('')
//   const [frequency, setFrequency] = useState<'hourly' | 'daily'>('hourly')
//   const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
//   const [error, setError] = useState<string | null>(null)

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault()
//     setStatus('loading')
//     setError(null)

//     try {
//       const payload: SubscriptionPayload = { email, city, frequency }
//       await subscribe(payload)
//       setStatus('success')
//     } catch (err: any) {
//       setError(err.message)
//       setStatus('error')
//     }
//   }

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-6"
//     >
//       <h2 className="text-2xl font-semibold text-gray-800 text-center">
//         Subscribe to Weather Updates
//       </h2>

//       {/* City */}
//       <div>
//         <label className="block text-gray-700 mb-1">City</label>
//         <input
//           type="text"
//           value={city}
//           onChange={e => setCity(e.target.value)}
//           required
//           className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//         />
//       </div>

//       {/* Email */}
//       <div>
//         <label className="block text-gray-700 mb-1">Email Address</label>
//         <input
//           type="email"
//           value={email}
//           onChange={e => setEmail(e.target.value)}
//           required
//           className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//         />
//       </div>

//       {/* Frequency */}
//       <div>
//         <label className="block text-gray-700 mb-1">Update Frequency</label>
//         <select
//           value={frequency}
//           onChange={e => setFrequency(e.target.value as any)}
//           className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
//         >
//           <option value="hourly">Hourly</option>
//           <option value="daily">Daily</option>
//         </select>
//       </div>

//       {/* Submit */}
//       <button
//         type="submit"
//         disabled={status === 'loading'}
//         className={`
//           w-full py-2 rounded-2xl text-white font-medium
//           ${status === 'loading' ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'}
//           focus:outline-none focus:ring-2 focus:ring-blue-400
//         `}
//       >
//         {status === 'loading' ? 'Sending…' : 'Subscribe'}
//       </button>

//       {/* Feedback */}
//       {status === 'success' && (
//         <p className="text-green-600 text-center">Subscription successful!</p>
//       )}
//       {status === 'error' && (
//         <p className="text-red-600 text-center">Error: {error}</p>
//       )}
//     </form>
//   )
// }

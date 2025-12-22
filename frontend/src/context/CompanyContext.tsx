// import { createContext, useEffect, useState } from 'react'
// import { authApi } from '../api/auth.api'

// export const CompanyContext = createContext<any>(null)

// export function CompanyProvider({ children }: { children: React.ReactNode }) {
//   const [company, setCompany] = useState<any>(null)

//   useEffect(() => {
//     authApi.me()
//       .then(res => setCompany(res.data.company))
//       .catch(() => setCompany(null))
//   }, [])

//   return (
//     <CompanyContext.Provider value={{ company }}>
//       {children}
//     </CompanyContext.Provider>
//   )
// }

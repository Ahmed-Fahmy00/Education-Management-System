export default function Container({ children }) {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      {children}
    </div>
  )
}

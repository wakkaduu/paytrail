import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // You could send this to a logging service
    console.error('ErrorBoundary caught', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: 24, color: '#fff', background: '#7f1d1d'}}>
          <h2>Something went wrong.</h2>
          <p>{String(this.state.error)}</p>
          <p>If this is related to Supabase initialization, check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env vars and the browser console.</p>
        </div>
      )
    }
    return this.props.children
  }
}

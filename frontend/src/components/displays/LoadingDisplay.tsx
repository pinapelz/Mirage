
interface LoadingDisplayProps {
  message?: string;
}

const LoadingDisplay = ({ message }: LoadingDisplayProps) => {
  return(
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-300">{message || 'Loading...'}</p>
      </div>
    </div>
  )
}

export default LoadingDisplay;

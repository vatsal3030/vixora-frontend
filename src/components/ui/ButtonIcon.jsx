const ButtonIcon = ({ children, onClick, disabled, className = '', title = '' }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-10 h-10 rounded-full bg-transparent hover:bg-white/10 border-none cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${className}`}
    >
      {children}
    </button>
  )
}

export default ButtonIcon

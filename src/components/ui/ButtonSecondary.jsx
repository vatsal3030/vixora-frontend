const ButtonSecondary = ({ children, onClick, disabled, className = '', type = 'button' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-[#3A3A3A] hover:bg-[#4A4A4A] text-white px-6 py-2.5 rounded-full text-sm font-semibold border-none cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  )
}

export default ButtonSecondary

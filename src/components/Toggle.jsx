const Toggle = ({ checked, onChange, disabled = false }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-[22px] w-[42px] items-center rounded-full
        transition-all duration-200 ease-in-out cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? 'bg-primary' : 'bg-[#2a2f3a]'}
      `}
    >
      <span
        className={`
          inline-block h-[18px] w-[18px] rounded-full shadow-sm 
          transition-all duration-200 ease-in-out
          ${checked 
            ? 'translate-x-[22px] bg-white' 
            : 'translate-x-[4px] bg-[#cbd5e1]'
          }
        `}
      />
    </button>
  )
}

export default Toggle

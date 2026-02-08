// components/admin/ActionButton.js
export default function ActionButton({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false,
  className = ''
}) {
  const baseClasses = 'px-4 py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white',
    secondary: 'bg-white/10 hover:bg-white/20 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  const baseStyles = 'px-4 py-2 rounded-md font-medium transition-colors';
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
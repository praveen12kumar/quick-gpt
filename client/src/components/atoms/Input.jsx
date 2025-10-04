
const Input = ({onChange, type, placeholder, value, style}) => {
  return (
    <input 
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      value={value}
      className={style}
    />
  );
};

export default Input;
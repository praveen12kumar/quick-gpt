
const Button = ({text, icon:Icon, style1, style2, onClick}) => {
  return (
    <button className={style1} onClick={onClick}>
        <Icon className={style2}/> {text} 
    </button>
  );
};

export default Button;
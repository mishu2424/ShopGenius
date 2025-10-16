const Title = ({ title, textColor, borderColor, icon: ICON,iconColor }) => {
  return (
    <div className={`flex items-center gap-3 border-s-8 ${borderColor} ps-3`}>
      <h2 className={`text-2xl font-bold ${textColor}`}>{title}</h2>
      <ICON className={`${iconColor}`}/>
    </div>
  );
};

export default Title;

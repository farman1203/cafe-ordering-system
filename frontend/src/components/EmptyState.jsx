export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="state-box">
      {Icon && <Icon size={42} />}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

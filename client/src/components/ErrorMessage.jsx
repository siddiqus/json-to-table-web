import "./ErrorMessage.css";

function ErrorMessage({ message, mono = false }) {
  if (!message) return null;

  return (
    <div className={`error-message ${mono ? "error-message--mono" : ""}`}>
      {message}
    </div>
  );
}

export default ErrorMessage;

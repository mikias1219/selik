interface ErrorAlertProps {
  message: string;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div
      className="bg-spotlight-red text-white p-4 rounded-lg shadow-lg animate-fade-in"
      role="alert"
    >
      <p className="font-body">{message}</p>
    </div>
  );
}

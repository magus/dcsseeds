export default function ForceError() {
  return (
    <button
      onClick={() => {
        throw new Error('purposeful error');
      }}
    >
      force error
    </button>
  );
}

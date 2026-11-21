export default function ArchiveDialog() {
  return (
    <div className="modal-overlay" id="psycho-archive" onClick={event => { if (event.target === event.currentTarget) window.closeArchive(); }}>
      <div className="modal-box"></div>
    </div>
  );
}

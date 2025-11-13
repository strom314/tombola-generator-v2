import "./WinningList.css";

function WinningList({ tickets }) {
  if (tickets.length === 0) {
    return (
      <div className="winning-list">
        <h2>Vylosované Lístky</h2>
        <p className="empty-message">No tickets drawn yet</p>
      </div>
    );
  }

  return (
    <div className="winning-list">
      <h2>Vylosované lístky ({tickets.length})</h2>
      <div className="tickets-grid">
        {tickets
          .slice()
          .reverse()
          .map((ticket, index) => (
            <div
              key={`${ticket.color}-${ticket.variant}-${ticket.number}-${index}`}
              className={`ticket-item color-${ticket.color}`}
            >
              <div className="ticket-item-number">{ticket.number}</div>
              <div className="ticket-item-variant">{ticket.variant}</div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default WinningList;

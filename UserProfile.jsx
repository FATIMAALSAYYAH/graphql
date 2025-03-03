<div className="user-profile-info">
  <div className="profile-field">
    <div className="field-label">Name:</div>
    <div className="field-value">{user.name}</div>
  </div>
  <div className="profile-field">
    <div className="field-label">Email:</div>
    <div className="field-value">{user.email}</div>
  </div>
  {/* Total XP field removed completely */}
  <div className="profile-field">
    <div className="field-label">Audit Ratio:</div>
    <div className="field-value">{user.auditRatio}</div>
  </div>
  <div className="profile-field">
    <div className="field-label">Audits Done (Up):</div>
    <div className="field-value">{user.auditsDone}</div>
  </div>
  <div className="profile-field">
    <div className="field-label">Audits Received (Down):</div>
    <div className="field-value">{user.auditsReceived}</div>
  </div>
  {/* ... existing code for other fields ... */}
</div> 
'use client';

import { FileText, Users } from 'lucide-react';

export default function Navbar({ users, currentUser, onSelectUser, onHomeClick }) {
  return (
    <header className="app-header">
      <div className="brand" onClick={onHomeClick} title="Return to Dashboard">
        <div className="brand-icon">
          <FileText size={18} />
        </div>
        <span>Ajaia Docs</span>
      </div>

      <div className="user-selector">
        <Users size={16} className="text-muted" />
        <select
          value={currentUser?.id || ''}
          onChange={(e) => {
            const selected = users.find((u) => u.id === e.target.value);
            if (selected) onSelectUser(selected);
          }}
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email.split('@')[0]})
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}

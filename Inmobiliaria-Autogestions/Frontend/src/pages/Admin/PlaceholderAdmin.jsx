import React from 'react';

const PlaceholderAdmin = ({ title }) => {
  return (
    <div className="admin-placeholder" style={{ padding: 'var(--spacing-xl)', background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-md)', color: 'var(--color-text)' }}>
        {title}
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-md)' }}>
        Esta sección de <strong>{title}</strong> está actualmente en construcción.
      </p>
    </div>
  );
};

export default PlaceholderAdmin;

export function OgImage({
  title,
  domain,
  versionFrom,
  versionTo,
}: {
  title: string;
  domain: string;
  versionFrom?: string | null;
  versionTo?: string | null;
}) {
  const version = versionFrom && versionTo;
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px',
        background: '#0a0f0e',
        color: '#e8efed',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 56,
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          maxWidth: 980,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        {version ? (
          <div
            style={{
              display: 'flex',
              gap: 10,
              fontFamily: 'ui-monospace, monospace',
              fontSize: 22,
              color: '#9db0ab',
            }}
          >
            <span>{versionFrom}</span>
            <span>→</span>
            <span>{versionTo}</span>
          </div>
        ) : (
          <div />
        )}
        <div style={{ display: 'flex', fontSize: 24, color: '#9db0ab' }}>{domain}</div>
      </div>
    </div>
  );
}

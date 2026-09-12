export default function AgentCenter() {
  const agents = [
    { name: 'Faculty Identity Agent', phase: 2, description: 'Manages faculty profiles and external identifiers', status: 'idle' },
    { name: 'Affiliation Intelligence Agent', phase: 2, description: 'Learns institutional affiliation variants', status: 'idle' },
    { name: 'Publication Discovery Agent', phase: 4, description: 'Searches research sources for new publications', status: 'idle' },
    { name: 'Metadata Normalization Agent', phase: 5, description: 'Standardizes publication metadata', status: 'idle' },
    { name: 'Deduplication Agent', phase: 5, description: 'Identifies and merges duplicate publications', status: 'idle' },
    { name: 'Faculty Attribution Agent', phase: 6, description: 'Links publications to VFSTR faculty', status: 'idle' },
    { name: 'Metadata Enrichment Agent', phase: 7, description: 'Adds journal quality metrics and indexing data', status: 'idle' },
    { name: 'Research Integrity Agent', phase: 8, description: 'Detects suspicious records and risk flags', status: 'idle' },
    { name: 'Citation Metrics Agent', phase: 9, description: 'Tracks citations, h-index, and i10-index', status: 'idle' },
    { name: 'Verification & Evidence Agent', phase: 6, description: 'Validates evidence chains and verification state', status: 'idle' },
    { name: 'Human Review Agent', phase: 10, description: 'Creates review queues for human decisions', status: 'idle' },
    { name: 'Reporting Agent', phase: 14, description: 'Generates reports and accreditation evidence', status: 'idle' },
    { name: 'Research Assistant', phase: 15, description: 'Natural language research knowledge base', status: 'idle' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Agent Activity Center
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Monitor the 13 specialized agents powering the research intelligence platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div key={agent.name} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`agent-dot agent-dot-${agent.status}`}></span>
                <h3
                  className="font-semibold text-sm"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {agent.name}
                </h3>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  background: 'var(--color-surface-800)',
                  color: 'var(--color-text-muted)',
                }}
              >
                Phase {agent.phase}
              </span>
            </div>

            <p
              className="text-xs mb-3"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {agent.description}
            </p>

            <div
              className="flex items-center justify-between pt-2 text-xs"
              style={{
                borderTop: '1px solid rgba(90, 122, 224, 0.1)',
                color: 'var(--color-text-muted)',
              }}
            >
              <span>Last run: —</span>
              <span>Records: 0</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

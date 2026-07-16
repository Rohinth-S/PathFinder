import React from 'react';

export default function TryPlatform() {
  return (
    <section className="section" id="try-pathfinder" style={{ scrollMarginTop: '60px' }}>
      <div className="section-header">
        <h2 className="section-title">Try <span className="accent">PathFinder</span></h2>
        <p className="section-subtitle">
          Test the prototype. Get the apk or launch the web preview to query our seed knowledge graph.
        </p>
      </div>

      <div className="try-layout">
        {/* Android Client */}
        <div className="try-card primary-try">
          <div style={{
            fontSize: '11px',
            fontFamily: 'var(--mono)',
            fontWeight: 'bold',
            background: 'rgba(84, 214, 194, 0.1)',
            color: 'var(--mint)',
            padding: '4px 10px',
            borderRadius: '99px',
            letterSpacing: '0.08em'
          }}>
            App
          </div>
          <h3 className="try-title">APK (Recommended)</h3>
          <p className="try-desc">
            Download and install the official PathFinder application. Experience full AI-guided onboarding, voice queries transcribing in real time, and dynamic path visuals on your mobile device.
          </p>
          <a href="#" className="try-btn btn-mint" onClick={(e) => e.preventDefault()}>
            Download APK ↗
          </a>
        </div>

        {/* Web Preview */}
        <div className="try-card">
          <div style={{
            fontSize: '11px',
            fontFamily: 'var(--mono)',
            fontWeight: 'bold',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--ink-dim)',
            padding: '4px 10px',
            borderRadius: '99px',
            letterSpacing: '0.08em'
          }}>
            WEB
          </div>
          <h3 className="try-title">Web Client Preview</h3>
          <p className="try-desc">
            Explore the interactive PathFinder platform directly in your web browser. Interact with the onboarding flow, search paths, and view experience charts without installing the app.
          </p>
          <a href="#" className="try-btn btn-outline" onClick={(e) => e.preventDefault()}>
            Launch Web Client ↗
          </a>
        </div>
      </div>
    </section>
  );
}

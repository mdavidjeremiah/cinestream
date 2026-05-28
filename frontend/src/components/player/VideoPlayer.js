import React, { useState } from 'react';
import { Download, Settings, ChevronDown, ExternalLink, Play, AlertCircle } from 'lucide-react';

const QUALITY_ORDER = ['4K', '1080p', '720p', '480p', '360p'];

export default function VideoPlayer({ sources = [], movieTitle = '' }) {
  const sorted = [...sources].sort(
    (a, b) => QUALITY_ORDER.indexOf(a.quality) - QUALITY_ORDER.indexOf(b.quality)
  );
  const [selectedQuality, setSelectedQuality] = useState(sorted[0]?.quality || '');
  const [qualityOpen, setQualityOpen] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);

  const current = sorted.find(s => s.quality === selectedQuality) || sorted[0];

  if (!current) {
    return (
      <div style={{
        aspectRatio: '16/9', background: 'var(--bg2)',
        borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 12,
        border: '1px solid var(--border)',
      }}>
        <AlertCircle size={40} color="var(--text3)" />
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>No video sources available</p>
      </div>
    );
  }

  const qualityColors = { '4K': '#9b59b6', '1080p': '#2ecc71', '720p': '#3498db', '480p': 'var(--gold)', '360p': 'var(--text3)' };

  return (
    <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', background: '#000', border: '1px solid var(--border)' }}>
      {/* Video iframe */}
      <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
        <iframe
          key={current.embed_url}
          src={current.embed_url}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          frameBorder="0"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          title={movieTitle}
        />
      </div>

      {/* Controls bar */}
      <div style={{
        background: 'var(--bg3)', padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, borderTop: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}>
        {/* Left: Now playing */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Play size={14} color="var(--accent)" fill="var(--accent)" />
          <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>
            Now playing in <span style={{ color: qualityColors[selectedQuality] || 'var(--text)', fontWeight: 700 }}>{selectedQuality}</span>
          </span>
        </div>

        {/* Right: Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Quality Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setQualityOpen(!qualityOpen); setShowDownloads(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '6px 12px',
                color: 'var(--text)', fontSize: 13, fontWeight: 600,
              }}
            >
              <Settings size={13} />
              Quality
              <span style={{ color: qualityColors[selectedQuality], fontWeight: 700 }}>
                {selectedQuality}
              </span>
              <ChevronDown size={13} style={{ transform: qualityOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>

            {qualityOpen && (
              <div style={{
                position: 'absolute', bottom: '100%', right: 0, marginBottom: 6,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', overflow: 'hidden',
                minWidth: 180, boxShadow: 'var(--shadow)', zIndex: 50,
              }}>
                <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Select Quality
                  </span>
                </div>
                {sorted.map(s => (
                  <button
                    key={s.quality}
                    onClick={() => { setSelectedQuality(s.quality); setQualityOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '9px 14px', color: selectedQuality === s.quality ? 'var(--text)' : 'var(--text2)',
                      fontSize: 14, background: selectedQuality === s.quality ? 'var(--surface)' : 'transparent',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (selectedQuality !== s.quality) e.currentTarget.style.background = 'var(--surface)'; }}
                    onMouseLeave={e => { if (selectedQuality !== s.quality) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        display: 'inline-block', width: 8, height: 8,
                        borderRadius: '50%', background: qualityColors[s.quality] || 'var(--text3)',
                      }} />
                      <span style={{ fontWeight: 600 }}>{s.quality}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>{s.file_size}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Downloads */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowDownloads(!showDownloads); setQualityOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.3)',
                borderRadius: 'var(--radius-sm)', padding: '6px 12px',
                color: 'var(--accent)', fontSize: 13, fontWeight: 600,
              }}
            >
              <Download size={13} />
              Download
              <ChevronDown size={13} style={{ transform: showDownloads ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>

            {showDownloads && (
              <div style={{
                position: 'absolute', bottom: '100%', right: 0, marginBottom: 6,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', overflow: 'hidden',
                minWidth: 200, boxShadow: 'var(--shadow)', zIndex: 50,
              }}>
                <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Download Options
                  </span>
                </div>
                {sorted.map(s => (
                  <a
                    key={s.quality}
                    href={s.download_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowDownloads(false)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '9px 14px', color: 'var(--text2)', fontSize: 14,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Download size={13} />
                      <span style={{ fontWeight: 600 }}>{s.quality}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{s.file_size || 'N/A'}</span>
                      <ExternalLink size={11} color="var(--text3)" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

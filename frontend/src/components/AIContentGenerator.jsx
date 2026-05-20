import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function AIContentGenerator({ onGenerateSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDisabled = !title.trim() && !description.trim();

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/admin/generate-product-content', { 
        title, 
        description 
      });
      
      onGenerateSuccess(res.data);
      toast.success('Content generated — saved as Draft. Review before publishing.');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to generate content. Please try again.');
      toast.error('Failed to generate content.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-content-generator" style={{ background: '#0f172a', color: '#e2e8f0', padding: '24px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <svg style={{ width: '24px', height: '24px', color: '#f97316' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>AI Content Assistant</h3>
      </div>
      
      <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>
        Provide a brief title or description, and our AI will automatically generate SEO-optimized content, pricing, categories, and attributes for your service.
      </p>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Base Title (Optional)
          </label>
          <input
            type="text"
            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', color: '#fff', outline: 'none' }}
            placeholder="e.g. AC Repair Expert"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Base Description (Optional)
          </label>
          <textarea
            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', color: '#fff', outline: 'none' }}
            rows={3}
            placeholder="e.g. Expert technician with 10 years experience repairing window and split ACs..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isDisabled || loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '9999px',
            fontWeight: '600',
            fontSize: '14px',
            backgroundColor: (isDisabled || loading) ? '#ea580c80' : '#ea580c',
            color: '#fff',
            border: 'none',
            cursor: (isDisabled || loading) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            alignSelf: 'flex-start'
          }}
        >
          {loading ? 'Generating Content...' : 'Generate AI Content ✨'}
        </button>
      </div>
    </div>
  );
}

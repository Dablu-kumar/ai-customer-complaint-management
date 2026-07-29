import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Save, Shield, Key, Database, FolderOpen, Eye, EyeOff, Sliders } from 'lucide-react';
import axios from 'axios';
import { showNotification } from '../store/slices/notificationSlice';
import Footer from '../components/Footer';

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [groqKey, setGroqKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [dbPath, setDbPath] = useState('');
  const [uploadPath, setUploadPath] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(false);

  // Advanced configurations
  const [provider, setProvider] = useState('Groq');
  const [model, setModel] = useState('gemma2-9b-it');
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(4096);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/settings', getHeaders());
        setDbPath(res.data.database_url);
        setUploadPath(res.data.upload_dir);
        setHasKey(res.data.has_groq_key);
        setProvider(res.data.ai_provider);
        setModel(res.data.ai_model);
        setTemperature(res.data.temperature);
        setMaxTokens(res.data.max_tokens);
        if (res.data.has_groq_key) {
          setGroqKey('••••••••••••••••••••••••••••••••••••••••');
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const keyToSend = groqKey.includes('••') ? '••••••••••••••••••••••••••••••••••••••••' : groqKey;
      
      const res = await axios.post('http://localhost:8000/api/settings', {
        groq_api_key: keyToSend,
        ai_provider: provider,
        ai_model: model,
        temperature: parseFloat(temperature),
        max_tokens: parseInt(maxTokens)
      }, getHeaders());
      
      setHasKey(res.data.has_groq_key);
      dispatch(showNotification({ message: 'QMS parameters saved successfully', type: 'success' }));
    } catch (error) {
      dispatch(showNotification({ message: 'Failed to update configurations', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Settings Form */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* API Credentials */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <Key size={20} color="var(--accent-cyan)" />
              AI Model Credentials
            </h3>
            {hasKey && (
              <span style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: 'var(--risk-low)',
                fontWeight: 600
              }}>
                Groq Connected ✓
              </span>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Groq API Key (Gemma2-9B-IT)</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showKey ? 'text' : 'password'}
                className="form-input"
                style={{ width: '100%', paddingRight: '48px' }}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {hasKey ? (
                <span style={{ color: 'var(--risk-low)', fontWeight: 600 }}>✓ API Key is configured and active.</span>
              ) : (
                <span>No API Key configured. System will default to Rule-Based Heuristic Analysis.</span>
              )}
            </span>
          </div>
        </div>

        {/* Advanced AI Hyperparameters */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={20} color="var(--accent-cyan)" />
            Advanced Agent Settings
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">AI Provider</label>
              <select className="form-select" value={provider} onChange={(e) => setProvider(e.target.value)}>
                <option value="Groq">Groq Cloud API</option>
                <option value="OpenAI">OpenAI (Mocked)</option>
                <option value="Anthropic">Anthropic (Mocked)</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">LLM Model Name</label>
              <select className="form-select" value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="gemma2-9b-it">gemma2-9b-it (Fast/Default)</option>
                <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Large)</option>
                <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Temperature: {temperature}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  background: 'var(--border-glass)',
                  height: '4px',
                  borderRadius: '2px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Max Token Output Limit</label>
              <input
                type="number"
                className="form-input"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
                min="256"
                max="8192"
                required
              />
            </div>
          </div>
        </div>

        {/* Database & File System */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={20} color="var(--accent-purple)" />
            Database & Storage Registry
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '6px' }}><Database size={12} />Active Database Connection</span>
              <div style={{ fontSize: '0.9rem', fontFamily: 'monospace', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-glass)', wordBreak: 'break-all' }}>
                {dbPath || 'sqlite:///C:/Users/dablu/.gemini/antigravity/scratch/aivoa-ai/database/aivoa.db'}
              </div>
            </div>

            <div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '6px' }}><FolderOpen size={12} />File Storage Upload Directory</span>
              <div style={{ fontSize: '0.9rem', fontFamily: 'monospace', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-glass)', wordBreak: 'break-all' }}>
                {uploadPath || 'C:/Users/dablu/.gemini/antigravity/scratch/aivoa-ai/uploads'}
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 24px' }} disabled={loading}>
          <Save size={16} />
          {loading ? 'Saving Settings...' : 'Save QMS Configuration'}
        </button>

      </form>

      <Footer />
    </div>
  );
};

export default Settings;

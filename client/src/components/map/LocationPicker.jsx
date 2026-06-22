import { useState, useRef, useEffect } from 'react';
import { MapPin, Search, X, Navigation } from 'lucide-react';

const LocationPicker = ({ label, type = 'pickup', value, onChange, placeholder, biasLocation }) => {
  const [query, setQuery] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const latestSuggestionsRef = useRef([]);

  useEffect(() => {
    if (value?.address) {
      setQuery(value.address);
    } else if (value === null) {
      setQuery('');
    }
  }, [value?.address, value]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocation = async (text) => {
    if (text.length < 3) {
      setSuggestions([]);
      latestSuggestionsRef.current = [];
      return;
    }

    setLoading(true);
    try {
      let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=10&addressdetails=1&countrycodes=in`;
      
      const bias = biasLocation || { lat: 12.9716, lng: 77.5946 };
      if (bias && bias.lat && bias.lng) {
        // Construct a viewbox of roughly ~1.0 degree (~111km) around the bias coordinate
        const minLng = bias.lng - 1.0;
        const maxLng = bias.lng + 1.0;
        const minLat = bias.lat - 1.0;
        const maxLat = bias.lat + 1.0;
        url += `&viewbox=${minLng},${maxLat},${maxLng},${minLat}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      const mapped = data.map((item) => {
        const addr = item.address || {};
        const main = item.name || addr.road || addr.suburb || addr.amenity || addr.building || item.display_name.split(',')[0];
        const secondary = item.display_name.replace(main + ',', '').trim();
        return {
          address: item.display_name,
          mainName: main,
          secondaryName: secondary || addr.city || addr.state || '',
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        };
      });
      setSuggestions(mapped);
      latestSuggestionsRef.current = mapped;
      setShowSuggestions(true);
    } catch (err) {
      console.error('Location search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);

    // If user clears the input, reset the location
    if (!text.trim()) {
      onChange(null);
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocation(text), 500);
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion.address);
    setShowSuggestions(false);
    onChange(suggestion);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Auto-select the first suggestion if available
      const currentSuggestions = latestSuggestionsRef.current;
      if (currentSuggestions.length > 0) {
        handleSelect(currentSuggestions[0]);
      } else if (query.trim().length >= 3) {
        // If no suggestions yet, force a search and auto-select the first result
        searchLocation(query.trim()).then(() => {
          const results = latestSuggestionsRef.current;
          if (results.length > 0) {
            handleSelect(results[0]);
          }
        });
      }
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          const location = {
            address: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            lat,
            lng,
          };
          setQuery(location.address);
          onChange(location);
        } catch {
          const location = { address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng };
          setQuery(location.address);
          onChange(location);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Unable to get current location');
      }
    );
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    latestSuggestionsRef.current = [];
    onChange(null);
  };

  return (
    <div className="form-group" ref={wrapperRef} style={{ position: 'relative' }}>
      {label && <label className="form-label">{label}</label>}
      <div style={{ position: 'relative' }}>
        <div className="form-input-icon">
          <MapPin
            size={16}
            className="icon"
            style={{ color: type === 'pickup' ? '#10b981' : '#ef4444' }}
          />
          <input
            type="text"
            className="form-input"
            placeholder={placeholder || (type === 'pickup' ? 'Enter pickup location' : 'Enter drop location')}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            id={`location-${type}`}
            style={{ paddingRight: '5rem' }}
          />
        </div>

        <div style={{
          position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
          display: 'flex', gap: '0.25rem',
        }}>
          {query && (
            <button className="btn btn-ghost btn-sm" onClick={handleClear} style={{ padding: '0.25rem' }}>
              <X size={14} />
            </button>
          )}
          {type === 'pickup' && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleCurrentLocation}
              title="Use current location"
              style={{ padding: '0.25rem' }}
              id="current-location-btn"
            >
              <Navigation size={14} />
            </button>
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="location-suggestions">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="suggestion-item"
              onClick={() => handleSelect(s)}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)' }}
            >
              <MapPin size={18} style={{ flexShrink: 0, opacity: 0.6, color: type === 'pickup' ? '#10b981' : '#ef4444' }} />
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--font-sm)', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.mainName}
                </span>
                {s.secondaryName && (
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.secondaryName}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ position: 'absolute', right: '4rem', top: '50%', transform: 'translateY(-50%)' }}>
          <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
        </div>
      )}
    </div>
  );
};

export default LocationPicker;

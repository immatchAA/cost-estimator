import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from "../Sidebar/Sidebar";
import './AddReadingMaterial.css';
import { supabase } from '../../supabaseClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

function AddReadingMaterial() {
  const location = useLocation();
  const navigate = useNavigate();
  const editMaterial = location.state?.material || null;

  const [title, setTitle] = useState('');
  const [sections, setSections] = useState([{ section_slug: '', content: '' }]);
  const [showPreview, setShowPreview] = useState(true);
  const [modal, setModal] = useState({ open: false, title: "", message: "", confirm: false, onConfirm: null });

  useEffect(() => {
    const loadMaterialData = async () => {
      if (!editMaterial?.id) return;
      setTitle(editMaterial.title || '');

      if (editMaterial.sections && editMaterial.sections.length > 0) {
        setSections(editMaterial.sections);
        return;
      }

      const { data: fetchedSections, error } = await supabase
        .from('reading_material_sections')
        .select('section_slug, content')
        .eq('reading_material_id', editMaterial.id);

      if (error) {
        console.error('Error fetching sections:', error.message);
        setSections([{ section_slug: '', content: '' }]);
      } else {
        setSections(
          Array.isArray(fetchedSections) && fetchedSections.length > 0
            ? fetchedSections
            : [{ section_slug: '', content: '' }]
        );
      }
    };

    loadMaterialData();
  }, [editMaterial]);

  const handleSectionChange = (index, field, value) => {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
  };

  const addSection = () => {
    setSections([...sections, { section_slug: '', content: '' }]);
  };

  const removeSection = (index) => {
    const updated = [...sections];
    updated.splice(index, 1);
    setSections(updated);
  };

const handleCancel = () => {
  setModal({
    open: true,
    message: "Discard changes and go back?",
    confirm: true,
    onConfirm: () => {
      setModal({ open: false });
      navigate("/reading-materials");
    }
  });
};


const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const slug = slugify(title);

    const userId = editMaterial?.user_id || crypto.randomUUID();

    const apiBaseNoPrefix = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace('/api', '') || "http://localhost:8000";
    const url = editMaterial
      ? `${apiBaseNoPrefix}/reading-materials/${editMaterial.id}` // PUT needs ID
      : `${apiBaseNoPrefix}/reading-materials`;

    const response = await fetch(url, {
      method: editMaterial ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        slug,
        user_id: userId,
        sections,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      setModal({
        open: true,
        message: editMaterial ? "Reading material updated!" : "Reading material added!",
        confirm: false
      });
      setTimeout(() => navigate("/reading-materials"), 1500);
    } else {
      throw new Error(result.detail || "Something went wrong");
    }
  } catch (error) {
        console.error("Submission failed:", error);
        setModal({
          open: true,
          title: "Error",
          message: `Error: ${error.message}`,
          confirm: false
        });
      }
};

  return (
    <div className="readingmaterial-wrapper">
      <Sidebar />
      <div className="readingmaterial-container">
        <div className="readingmaterial-header">
          <div>
            <h1>{editMaterial ? 'EDIT' : 'ADD'} READING MATERIAL</h1>
            <p>{editMaterial ? 'Edit existing material' : 'Add or Create Reading Materials here.'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="readingmaterial-form">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Sections</h3>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              style={{
                backgroundColor: '#145a99',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
              }}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>

          {sections.map((section, index) => (
            <div key={index} className="readingmaterial-section-card">
              <label>Section Slug</label>
              <input
                type="text"
                value={section.section_slug}
                onChange={(e) => handleSectionChange(index, 'section_slug', e.target.value)}
                required
              />

              <label className="content-label">
                Content <span className="tooltip-trigger">?</span>
                <div className="markdown-tooltip">
                  <h4>Markdown Guide</h4>
                  <ul>
                    <li><code>**bold text**</code> → <strong>bold text</strong></li>
                    <li><code>*italic text*</code> → <em>italic text</em></li>
                    <li><code>- List item</code> → bullet point</li>
                    <li><code>[Link Text](https://example.com)</code> → clickable link</li>
                    <li><code>**Subheading**</code> → bolded block title</li>
                  </ul>
                </div>
              </label>

              <textarea
                value={section.content}
                onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                required
              />

              {showPreview && (
                <>
                  <label className="preview-label">Live Preview</label>
                  <div className="preview-box">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {section.content}
                    </ReactMarkdown>
                  </div>

                </>
              )}

              {sections.length > 1 && (
                <div className="button-right-wrapper">
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="remove-section-btn"
                  >
                    Remove Section
                  </button>
                </div>
              )}
            </div>
          ))}

          <button type="button" onClick={addSection} className="add-section-btn">
            + Add Section
          </button>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="equal-btn submit-btn">
              {editMaterial ? 'Update' : 'Add'}
            </button>
            <button type="button" className="equal-btn remove-section-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>

        {modal.open && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>{modal.title}</h3>
              <p>{modal.message}</p>
              <div className="modal-actions">
                {modal.confirm ? (
                  <>
                    <button
                      onClick={modal.onConfirm}
                      className="modal-btn confirm"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setModal({ open: false })}
                      className="modal-btn cancel"
                    >
                      No
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setModal({ open: false })}
                    className="modal-btn"
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AddReadingMaterial;

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './AddReadingMaterial.css';
import { supabase } from '../../supabaseClient';
import ReactMarkdown from 'react-markdown';

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
    if (window.confirm('Discard changes and go back?')) {
      navigate('/reading-materials');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        alert('You must be logged in to submit a reading material.');
        return;
      }

      const slug = slugify(title);
      let materialId;

      if (editMaterial) {
        const { error: updateError } = await supabase
          .from('reading_materials')
          .update({ title, slug, updated_at: new Date().toISOString() })
          .eq('id', editMaterial.id);


        if (updateError) throw updateError;
        materialId = editMaterial.id;

        await supabase
          .from('reading_material_sections')
          .delete()
          .eq('reading_material_id', materialId);
      } else {
        const { data: materialData, error: insertError } = await supabase
          .from('reading_materials')
          .insert([{ title, slug, user_id: user.id }])
          .select()
          .single();

        if (insertError) throw insertError;
        materialId = materialData.id;
      }

      const sectionData = sections.map((section) => ({
        reading_material_id: materialId,
        section_slug: section.section_slug,
        content: section.content,
      }));

      const { error: sectionError } = await supabase
        .from('reading_material_sections')
        .insert(sectionData);

      if (sectionError) throw sectionError;

      alert(editMaterial ? 'Reading material updated!' : 'Reading material added!');
      navigate('/reading-materials');
    } catch (error) {
      console.error('Submission failed:', error);
      alert(`Error: ${error.message}`);
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
                    <ReactMarkdown>{section.content}</ReactMarkdown>
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

      </div>
    </div>
  );
}

export default AddReadingMaterial;

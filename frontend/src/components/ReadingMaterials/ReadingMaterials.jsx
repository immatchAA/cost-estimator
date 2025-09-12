import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { formatDistanceToNow } from 'date-fns';
import Sidebar from './Sidebar';
import './ReadingMaterials.css';

function ReadingMaterials() {
  const [materials, setMaterials] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterials = async () => {
      const { data: materialsData, error: materialsError } = await supabase
        .from('reading_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (materialsError) {
        console.error('Error fetching materials:', materialsError);
        return;
      }

      const promises = materialsData.map(async (material) => {
        const { data: sections, error } = await supabase
          .from('reading_material_sections')
          .select('section_slug, content')
          .eq('reading_material_id', material.id);

        if (error) {
          console.error(`Error fetching sections for material ${material.id}:`, error);
        }

        return {
          ...material,
          sections: sections || [],
        };
      });

      const materialsWithSections = await Promise.all(promises);
      setMaterials(materialsWithSections);
    };

    fetchMaterials();
  }, []);

  const handleAddClick = () => {
    navigate('/add-reading-material');
  };

  const handleEdit = (material) => {
    navigate('/add-reading-material', {
      state: {
        material: {
          id: material.id,
          title: material.title,
          slug: material.slug,
          sections: material.sections || [],
        },
      },
    });
  };

  const handleDelete = async (materialId) => {
    const confirm = window.confirm('Are you sure you want to delete this material?');
    if (!confirm) return;

    try {
      await supabase.from('reading_material_sections').delete().eq('reading_material_id', materialId);
      await supabase.from('reading_materials').delete().eq('id', materialId);

      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
      alert('Deleted successfully.');
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Failed to delete. See console for details.');
    }
  };

  return (
    <div className="readingmaterial-wrapper">
      <Sidebar />
      <div className="readingmaterial-container">
        <div className="readingmaterial-header">
          <div>
            <h1>READING MATERIALS</h1>
            <p>Browse all available reading materials.</p>
          </div>
          <button className="add-section-btn" onClick={handleAddClick}>
            + Add Reading Material
          </button>
        </div>

        {materials.map((material) => (
          <div key={material.id} className="readingmaterial-section-card">
            <div className="readingmaterial-card-header">
              <h2>{material.title}</h2>
              <div>
                <button className="edit-btn" onClick={() => handleEdit(material)}>
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(material.id)}
                  style={{ marginLeft: '10px' }}
                >
                  Delete
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#888' }}>
            {material.updated_at
              ? `Updated on: ${new Date(material.updated_at).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })} (${formatDistanceToNow(new Date(material.updated_at), { addSuffix: true })})`
              : `Created on: ${new Date(material.created_at).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })} (${formatDistanceToNow(new Date(material.created_at), { addSuffix: true })})`}
          </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReadingMaterials;

/* ========================================
   ARCHITECT PRO - Premium AI Theme
   JavaScript Logic
   ======================================== */

// DOM Elements
const container = document.getElementById('fieldsContainer');
const preview = document.getElementById('jsonPreview');
const textPreview = document.getElementById('textPreview');
const selector = document.getElementById('templateSelector');
const negativeInput = document.getElementById('negativePrompt');
const importArea = document.getElementById('importArea');
const importSection = document.getElementById('importSection');

// Templates Data
const templates = {
    hero: [
        { k: "objeto", v: "Lata de refresco premium", p: "Sujeto principal" },
        { k: "materiales", v: "Aluminio cepillado, gotas de agua", p: "Texturas PBR" },
        { k: "iluminacion", v: "Studio lighting, 3 puntos de luz", p: "Esquema de luz" },
        { k: "ambiente", v: "Fondo minimalista oscuro", p: "Escenario" },
        { k: "camara", v: "85mm macro, ángulo de nivel", p: "Lente y encuadre" }
    ],
    lifestyle: [
        { k: "persona", v: "Mujer joven, estilo casual", p: "Sujeto / Modelo" },
        { k: "etnia", v: "Rasgos latinos", p: "Apariencia" },
        { k: "vestimenta", v: "Chaqueta de lino blanca", p: "Outfit" },
        { k: "entorno", v: "Cafetería moderna con plantas", p: "Location" },
        { k: "emocion", v: "Alegría natural", p: "Mood" }
    ],
    arquitectura: [
        { k: "estilo", v: "Minimalismo Japonés", p: "Arquitectura" },
        { k: "estructura", v: "Casa con patio central", p: "Tipo" },
        { k: "materiales", v: "Concreto pulido, madera de roble", p: "Acabados" },
        { k: "iluminacion", v: "Golden hour", p: "Momento" }
    ],
    ui_ux: [
        { k: "plataforma", v: "App móvil de Finanzas", p: "Dispositivo" },
        { k: "estilo_visual", v: "Glassmorphism moderno", p: "Tendencia" },
        { k: "paleta", v: "Deep blue, cyan accents", p: "Colores" },
        { k: "componentes", v: "Bento grid system", p: "Layout" }
    ],
    vfx: [
        { k: "mundo", v: "Ciudadela en ruinas", p: "Escenario" },
        { k: "atmosfera", v: "Tormenta de arena", p: "Ambiente" },
        { k: "vfx", v: "Luz volumétrica", p: "Efectos" },
        { k: "motor", v: "Unreal Engine 5.4", p: "Render Tech" }
    ],
    arte: [
        { k: "tecnica", v: "Óleo sobre lienzo", p: "Medio" },
        { k: "estilo", v: "Expresionismo", p: "Corriente" },
        { k: "sujeto", v: "Astronauta antiguo", p: "Sujeto" },
        { k: "detalle", v: "Textura de papel rugoso", p: "Acabado" }
    ],
    empty: []
};

/**
 * Switch between editor and import views
 */
function switchTab(view) {
    if (view === 'import') {
        importSection.classList.add('active');
    } else {
        importSection.classList.remove('active');
    }
}

/**
 * Add a new field row to the form
 */
function addField(key = "", value = "", placeholder = "Valor...") {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = "field-row";
    fieldDiv.innerHTML = `
        <input type="text" placeholder="Categoría" value="${key}" class="input-field field-key key-input">
        <input type="text" placeholder="${placeholder}" value='${value}' class="input-field field-value value-input">
        <button onclick="this.parentElement.remove(); updateJSON();" class="btn-remove" aria-label="Eliminar campo">&times;</button>
    `;
    container.appendChild(fieldDiv);
    fieldDiv.querySelectorAll('input').forEach(input => input.addEventListener('input', updateJSON));
    updateJSON();
}

/**
 * Load a template from the dropdown
 */
function loadTemplate() {
    container.innerHTML = "";
    if (templates[selector.value]) {
        templates[selector.value].forEach(f => addField(f.k, f.v, f.p));
    }
    updateJSON();
}

/**
 * Update JSON preview and clean prompt text
 */
function updateJSON() {
    const result = {
        prompt_structure: { negative_prompt: negativeInput.value }
    };

    let promptParts = [];
    document.querySelectorAll('.key-input').forEach((keyInput, index) => {
        const k = keyInput.value.toLowerCase().trim().replace(/\s+/g, '_') || `extra_${index}`;
        let v = document.querySelectorAll('.value-input')[index].value;

        try {
            if ((v.startsWith('{') && v.endsWith('}')) || (v.startsWith('[') && v.endsWith(']'))) v = JSON.parse(v);
        } catch (e) {}

        result.prompt_structure[k] = v;

        const clean = (val) => {
            if (typeof val === 'object') return JSON.stringify(val).replace(/[{} "[\]]/g, '').replace(/:/g, ': ').replace(/,/g, ', ');
            return val;
        };

        if (v && v.toString().trim() !== "") promptParts.push(clean(v));
    });

    preview.textContent = JSON.stringify(result, null, 4);
    textPreview.textContent = promptParts.join(", ") + (negativeInput.value ? " --no " + negativeInput.value : "");
}

/**
 * Import JSON data from textarea
 */
function importJSON() {
    try {
        const data = JSON.parse(importArea.value);
        const structure = data.prompt_structure || data;
        container.innerHTML = "";
        if (structure.negative_prompt) negativeInput.value = structure.negative_prompt;
        for (const key in structure) {
            if (key !== 'negative_prompt' && key !== 'metadata') {
                let val = structure[key];
                addField(key.replace(/_/g, ' '), (typeof val === 'object' ? JSON.stringify(val) : val));
            }
        }
        importArea.value = "";
        switchTab('editor');
        updateJSON();
    } catch (e) {
        alert("JSON no válido.");
    }
}

/**
 * Copy clean prompt to clipboard
 */
function copyCleanPrompt() {
    navigator.clipboard.writeText(textPreview.textContent.replace(/"/g, '').trim());
    showNotification("Prompt copiado al portapapeles");
}

/**
 * Copy JSON to clipboard
 */
function copyToClipboard() {
    navigator.clipboard.writeText(preview.textContent);
    showNotification("JSON copiado al portapapeles");
}

/**
 * Download JSON file
 */
function downloadJSON() {
    const blob = new Blob([preview.textContent], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `architect-export-${Date.now()}.json`;
    a.click();
    showNotification("Archivo JSON descargado");
}

/**
 * Add library item to fields when clicked
 */
function addLibraryItem(category, keyword, description) {
    // Create a formatted key based on category
    const categoryMap = {
        'Cámara': 'camara',
        'Lentes': 'lente',
        'Composición': 'composicion',
        'Iluminación': 'iluminacion',
        'Fotografía': 'estilo_foto',
        'Ilustración': 'estilo_ilustracion',
        'UX / UI': 'ui_style'
    };
    
    // Find matching category key
    let fieldKey = 'estilo';
    for (const [cat, key] of Object.entries(categoryMap)) {
        if (category.includes(cat)) {
            fieldKey = key;
            break;
        }
    }
    
    // Add the field with the keyword as value
    addField(fieldKey, keyword, description);
    
    // Scroll to the fields container
    container.scrollTop = container.scrollHeight;
    
    // Show notification
    showNotification(`"${keyword}" añadido al prompt`);
}

/**
 * Initialize library item click handlers
 */
function initLibraryClicks() {
    document.querySelectorAll('.cheat-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Get the category from the parent details summary
            const details = item.closest('.cheat-card');
            const category = details.querySelector('summary span:first-child').textContent;
            
            // Parse the item content - extract keyword (bold text) and description
            const boldText = item.querySelector('b');
            if (boldText) {
                const keyword = boldText.textContent.replace(':', '').trim();
                const fullText = item.textContent;
                const description = fullText.replace(boldText.textContent, '').trim();
                
                addLibraryItem(category, keyword, description);
            }
        });
    });
}

/**
 * Show notification toast
 */
function showNotification(message) {
    // Remove existing notification if any
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #c9a962, #8b7235);
        color: #0a0a0a;
        padding: 12px 32px;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.05em;
        box-shadow: 0 10px 40px rgba(201, 169, 98, 0.3);
        z-index: 1000;
        animation: toastIn 0.3s ease forwards;
    `;

    // Add animation keyframes
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes toastIn {
                from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            @keyframes toastOut {
                from { opacity: 1; transform: translateX(-50%) translateY(0); }
                to { opacity: 0; transform: translateX(-50%) translateY(20px); }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Initialize on page load
loadTemplate();
initLibraryClicks();

// Initialize Lucide Icons
lucide.createIcons();

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
        { k: "sujeto", v: "Lata de refresco premium", p: "Sujeto principal" },
        { k: "materiales", v: "Aluminio cepillado, gotas de agua", p: "Texturas" },
        { k: "iluminacion", v: "Studio lighting, 3 puntos de luz", p: "Luz" },
        { k: "ambiente", v: "Fondo minimalista oscuro", p: "Escenario" },
        { k: "camara", v: "85mm macro, ángulo de nivel", p: "Lente" }
    ],
    lifestyle: [
        { k: "persona", v: "Mujer joven, estilo casual", p: "Sujeto" },
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
        { k: "layout", v: "Bento grid system", p: "Layout" }
    ],
    vfx: [
        { k: "mundo", v: "Ciudadela en ruinas", p: "Escenario" },
        { k: "atmosfera", v: "Tormenta de arena", p: "Ambiente" },
        { k: "vfx", v: "Luz volumétrica", p: "Efectos" },
        { k: "motor", v: "Unreal Engine 5", p: "Render Tech" }
    ],
    arte: [
        { k: "tecnica", v: "Óleo sobre lienzo", p: "Medio" },
        { k: "estilo", v: "Expresionismo", p: "Corriente" },
        { k: "sujeto", v: "Astronauta antiguo", p: "Sujeto" },
        { k: "detalle", v: "Textura de papel rugoso", p: "Acabado" }
    ],
    empty: []
};

// State flag
let isSyncing = false;
let draggedItem = null;

/**
 * UI Controls
 */
function switchTab(view) {
    if (view === 'import') {
        importSection.classList.add('active');
        importArea.focus();
    } else {
        importSection.classList.remove('active');
    }
}

/**
 * Fields Management
 */
function createFieldRow(key = "", value = "", placeholder = "Valor...") {
    const row = document.createElement('div');
    row.className = "field-row";
    row.draggable = true;
    
    row.innerHTML = `
        <button class="btn-drag" title="Arrastrar para reordenar">
            <i data-lucide="grip-vertical"></i>
        </button>
        <input type="text" placeholder="Categoría" value="${key}" class="input-field field-key key-input">
        <input type="text" placeholder="${placeholder}" value='${value}' class="input-field field-value value-input">
        <button class="btn-remove" title="Eliminar">
            <i data-lucide="trash-2"></i>
        </button>
    `;

    // Attach drag events
    row.addEventListener('dragstart', handleDragStart);
    row.addEventListener('dragover', handleDragOver);
    row.addEventListener('drop', handleDrop);
    row.addEventListener('dragend', handleDragEnd);

    // Attach input & remove events
    row.querySelectorAll('input').forEach(input => input.addEventListener('input', updateJSON));
    row.querySelector('.btn-remove').addEventListener('click', () => {
        row.style.transform = 'scale(0.9) translateX(20px)';
        row.style.opacity = '0';
        setTimeout(() => {
            row.remove();
            updateJSON();
        }, 300);
    });

    return row;
}

function addField(key = "", value = "", placeholder = "Valor...") {
    const row = createFieldRow(key, value, placeholder);
    container.appendChild(row);
    lucide.createIcons({ root: row });
    updateJSON();
    
    // Auto focus if added empty
    if(key === "") {
        setTimeout(() => row.querySelector('.key-input').focus(), 50);
    }
}

/**
 * Drag and Drop Logic
 */
function handleDragStart(e) {
    draggedItem = this;
    setTimeout(() => this.classList.add('dragging'), 0);
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.target.closest('.field-row');
    if(target && target !== draggedItem) {
        const bounding = target.getBoundingClientRect();
        const offset = bounding.y + (bounding.height / 2);
        if(e.clientY - offset > 0) {
            target.style.borderBottom = "2px solid var(--brand-rose)";
            target.style.borderTop = "";
        } else {
            target.style.borderTop = "2px solid var(--brand-rose)";
            target.style.borderBottom = "";
        }
    }
}

function handleDrop(e) {
    e.preventDefault();
    const target = e.target.closest('.field-row');
    if(target && target !== draggedItem) {
        const bounding = target.getBoundingClientRect();
        const offset = bounding.y + (bounding.height / 2);
        if(e.clientY - offset > 0) {
            target.parentNode.insertBefore(draggedItem, target.nextSibling);
        } else {
            target.parentNode.insertBefore(draggedItem, target);
        }
    }
    
    // Reset borders
    container.querySelectorAll('.field-row').forEach(row => {
        row.style.borderTop = "";
        row.style.borderBottom = "";
    });
    
    updateJSON();
}

function handleDragEnd() {
    this.classList.remove('dragging');
    draggedItem = null;
    container.querySelectorAll('.field-row').forEach(row => {
        row.style.borderTop = "";
        row.style.borderBottom = "";
    });
}

function loadTemplate() {
    container.innerHTML = "";
    const selected = templates[selector.value];
    if (selected) {
        selected.forEach(f => {
            const row = createFieldRow(f.k, f.v, f.p);
            container.appendChild(row);
        });
        lucide.createIcons();
    }
    updateJSON();
}

/**
 * Data Syncing (UI <-> JSON)
 */
function updateJSON() {
    if (isSyncing) return;
    
    const result = {
        prompt_structure: {}
    };
    
    // Use an object to avoid duplicate keys logic cleanly if needed, but array preserves order via DOM
    let promptParts = [];
    
    if(negativeInput.value.trim() !== '') {
        result.prompt_structure.negative_prompt = negativeInput.value;
    }

    document.querySelectorAll('.field-row').forEach((row, index) => {
        const keyInput = row.querySelector('.key-input');
        const valueInput = row.querySelector('.value-input');
        
        let k = keyInput.value.trim();
        // Convert to valid JSON key format (no spaces) if desired, but arbitrary strings are valid JSON keys.
        k = k || `extra_${index}`;
        
        let v = valueInput.value;
        
        // Try parsing arrays/objects loosely
        try {
            if ((v.startsWith('{') && v.endsWith('}')) || (v.startsWith('[') && v.endsWith(']'))) {
                v = JSON.parse(v);
            }
        } catch (e) {}

        result.prompt_structure[k] = v;

        // Build clean string
        if (v && v.toString().trim() !== "") {
            const clean = typeof v === 'object' ? JSON.stringify(v).replace(/[{} "[\]]/g, '') : v;
            promptParts.push(clean);
        }
    });

    preview.value = JSON.stringify(result, null, 4);
    
    let finalText = promptParts.join(", ");
    if (negativeInput.value.trim() !== '') {
        finalText += " --no " + negativeInput.value.trim();
    }
    textPreview.textContent = finalText;
}

function syncFromJSON() {
    if (isSyncing) return;
    
    try {
        const data = JSON.parse(preview.value);
        const structure = data.prompt_structure || data;
        
        isSyncing = true;
        
        if (structure.negative_prompt !== undefined) {
            negativeInput.value = structure.negative_prompt;
        } else {
            negativeInput.value = "";
        }
        
        const keys = Object.keys(structure).filter(k => k !== 'negative_prompt' && k !== 'metadata');
        const currentRows = container.querySelectorAll('.field-row');
        
        // Match lengths
        while(currentRows.length > keys.length) {
            container.lastChild.remove();
        }
        
        keys.forEach((key, index) => {
            let val = structure[key];
            const displayValue = typeof val === 'object' ? JSON.stringify(val) : val;
            
            const existingRow = container.querySelectorAll('.field-row')[index];
            if (existingRow) {
                existingRow.querySelector('.key-input').value = key;
                existingRow.querySelector('.value-input').value = displayValue;
            } else {
                const row = createFieldRow(key, displayValue);
                container.appendChild(row);
                lucide.createIcons({ root: row });
            }
        });
        
        // Update Clean Text
        let promptParts = keys.map(k => {
            let v = structure[k];
            return typeof v === 'object' ? JSON.stringify(v).replace(/[{} "[\]]/g, '') : v;
        }).filter(v => v !== "");
        
        let finalText = promptParts.join(", ");
        if (negativeInput.value.trim() !== '') {
            finalText += " --no " + negativeInput.value.trim();
        }
        textPreview.textContent = finalText;
        
        isSyncing = false;
        
    } catch (e) {
        // Just fail silently while typing invalid JSON
        isSyncing = false;
    }
}

/**
 * Import/Export Actions
 */
function importJSON() {
    try {
        const data = JSON.parse(importArea.value);
        const structure = data.prompt_structure || data;
        container.innerHTML = "";
        
        if (structure.negative_prompt) {
            negativeInput.value = structure.negative_prompt;
        } else {
            negativeInput.value = "";
        }
        
        for (const key in structure) {
            if (key !== 'negative_prompt' && key !== 'metadata') {
                let val = structure[key];
                const row = createFieldRow(key, typeof val === 'object' ? JSON.stringify(val) : val);
                container.appendChild(row);
            }
        }
        lucide.createIcons();
        importArea.value = "";
        switchTab('editor');
        updateJSON();
        showToast("JSON Importado con éxito", "check-circle");
    } catch (e) {
        showToast("JSON no válido", "alert-circle");
    }
}

const aiPromptsData = {
    general: `Actúa como un experto en ingeniería de prompts (Prompt Engineering) para Midjourney, Stable Diffusion y modelos de generación de imágenes de alta gama.
Tu tarea es describir detalladamente [INSTRUCCIÓN: describe la imagen o idea] y estructurar la información en formato JSON plano compatible con mi sistema.
Crea categorías (llaves) que describan los elementos (ej. "sujeto", "entorno", "iluminacion", "estilo") y usa descripciones ricas de keywords separadas por comas.
IMPORTANTE: Devuelve ÚNICAMENTE código JSON válido encapsulado en Markdown. El JSON debe tener un objeto raíz llamado "prompt_structure". Dentro de él, incluye tus categorías, y asegura incluir una llave "negative_prompt" para lo que NO debe aparecer. Ejemplo: {"prompt_structure": {"sujeto": "...", "iluminacion": "...", "negative_prompt": "low quality, text"}}`,

    interior: `Actúa como un experto en ingeniería de prompts. Analiza la imagen de diseño de interiores y convierte toda la información visual a un formato JSON estructurado y altamente detallado.
Concéntrate específicamente en aislar objetos individuales y la ubicación de las luces. Para cada objeto clave, extrae su color preciso y material exacto (ej. cuero mate, madera de roble).
CRÍTICO: Devuelve ÚNICAMENTE código JSON válido dentro de un bloque Markdown, siguiendo exactamente esta estructura:
{
  "prompt_structure": {
    "room_style": "...",
    "overall_colour_palette": "...",
    "key_objects": "...",
    "lighting_position": "...",
    "negative_prompt": "low quality, blurry, distorted"
  }
}`,

    layout: `Actúa como un experto en ingeniería de prompts. Analiza esta imagen de una habitación interior y extrae los datos espaciales y de distribución a un formato JSON estructurado.
Concéntrate en el acomodo de los muebles existentes y las proporciones espaciales.
CRÍTICO: Devuelve ÚNICAMENTE código JSON válido dentro de un bloque Markdown, siguiendo exactamente esta estructura:
{
  "prompt_structure": {
    "architectural_style": "...",
    "room_dimensions_estimate": "...",
    "lighting_setup": "...",
    "furniture_layout": "...",
    "negative_prompt": "low quality, deformed people"
  }
}`,

    object: `Actúa como un experto en ingeniería de prompts. Analiza esta imagen de una pieza de mobiliario u objeto independiente.
Extrae sus especificaciones exactas de diseño a un formato JSON estructurado para que pueda ser integrado en otra escena.
CRÍTICO: Devuelve ÚNICAMENTE código JSON válido dentro de un bloque Markdown, siguiendo exactamente esta estructura:
{
  "prompt_structure": {
    "furniture_type": "...",
    "design_style": "...",
    "primary_material": "...",
    "color_palette": "...",
    "notable_features": "...",
    "negative_prompt": "low quality, background, context"
  }
}`,

    atmosphere: `Actúa como un experto en ingeniería de prompts. Analiza las propiedades físicas y atmosféricas de esta imagen interior y conviértelas a un formato JSON estructurado.
Presta extrema atención a la configuración de iluminación y al entorno exterior visible.
CRÍTICO: Devuelve ÚNICAMENTE código JSON válido dentro de un bloque Markdown, siguiendo exactamente esta estructura:
{
  "prompt_structure": {
    "architectural_elements": "...",
    "current_lighting_type": "...",
    "light_source_positions": "...",
    "shadow_intensity": "...",
    "exterior_weather_visible": "...",
    "negative_prompt": "low quality, flat lighting"
  }
}`,

    camera: `Actúa como un experto en composición fotográfica. Analiza esta fotografía arquitectónica y extrae la configuración geométrica y técnica de cámara en un JSON estructurado.
REGLA ESTRICTA: No incluyas descripciones de objetos, materiales o sujetos. Enfócate completamente en la composición espacial, características del lente y encuadre. Describe los puntos de fuga de forma matemática y los puntos focales con términos de cuadrícula.
CRÍTICO: Devuelve ÚNICAMENTE código JSON válido dentro de un bloque Markdown, siguiendo exactamente esta estructura:
{
  "prompt_structure": {
    "camera_angle": "...",
    "estimated_focal_length": "...",
    "depth_of_field": "...",
    "vanishing_points": "...",
    "focal_point_grid": "...",
    "negative_prompt": "objects, people, specific structures"
  }
}`,

    branding: `Actúa como un experto en diseño gráfico. Analiza esta imagen que contiene elementos de tipografía y branding, y extrae los detalles en un formato JSON estructurado.
Concéntrate fuertemente en el contenido exacto del texto, estilo de la fuente y características del logotipo.
CRÍTICO: Devuelve ÚNICAMENTE código JSON válido dentro de un bloque Markdown, siguiendo exactamente esta estructura:
{
  "prompt_structure": {
    "background_context": "...",
    "exact_text_string": "...",
    "font_style_description": "...",
    "brand_colors": "...",
    "logo_shape_description": "...",
    "negative_prompt": "low quality, messy, unreadable text"
  }
}`
};

function copyAiPrompt() {
    const selector = document.getElementById('aiPromptSelector');
    const promptText = aiPromptsData[selector ? selector.value : 'general'];
    navigator.clipboard.writeText(promptText);
    showToast("Prompt IA copiado al portapapeles", "bot");
}

function copyCleanPrompt() {
    const text = textPreview.textContent.trim();
    if(!text) return showToast("No hay prompt para copiar", "alert-triangle");
    navigator.clipboard.writeText(text);
    showToast("Prompt copiado al portapapeles", "copy-check");
}

function copyToClipboard() {
    navigator.clipboard.writeText(preview.value);
    showToast("JSON copiado al portapapeles", "copy-check");
}

function downloadJSON() {
    const blob = new Blob([preview.value], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `architect-prompt-${Date.now()}.json`;
    a.click();
    showToast("Archivo exportado", "download");
}

/**
 * Bento Library Integration
 */
let currentCategoryIndex = 0;
const cards = document.querySelectorAll('.bento-card');

function showCategory(index) {
    if (cards.length === 0) return;
    cards.forEach(card => card.classList.remove('active'));
    
    if (index >= cards.length) {
        currentCategoryIndex = 0;
    } else if (index < 0) {
        currentCategoryIndex = cards.length - 1;
    } else {
        currentCategoryIndex = index;
    }
    
    cards[currentCategoryIndex].classList.add('active');
}

window.prevCategory = function() {
    showCategory(currentCategoryIndex - 1);
};

window.nextCategory = function() {
    showCategory(currentCategoryIndex + 1);
};

document.querySelectorAll('.bento-tags .tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
        let val = e.target.getAttribute('data-val') || e.target.textContent;
        let categoryElement = e.target.closest('.bento-card').getAttribute('data-category');
        
        // formatting the target key nicely
        let keyFormatted = categoryElement.toLowerCase().replace(/\s+/g, '_');
        if(keyFormatted === "aspect_ratio") keyFormatted = "ar";
        
        addField(keyFormatted, val);
        showToast(`"${val}" añadido`, "plus-circle");
        
        // Scroll editor to bottom smoothly
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
        });
    });
});

/**
 * Modern Toast System
 */
function showToast(message, iconName = "info") {
    const toaster = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${message}</span>`;
    
    toaster.appendChild(toast);
    lucide.createIcons({ root: toast });

    setTimeout(() => {
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => toast.remove());
    }, 2500);
}

// Initial Bootstrap
loadTemplate();

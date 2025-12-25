import { v4 as uuidv4 } from 'uuid';

/**
 * Storage Service - Local Storage Implementation
 * Replaces backend API calls
 */

const STORAGE_KEYS = {
  PROJECTS: 'dt_projects',
  DOCUMENTS: 'dt_documents',
  TEMPLATES: 'dt_templates',
  VERSION: 'dt_version' // For potential migrations
};

// Seed Data (from original server/prisma/seed.js)
const DEFAULT_TEMPLATES = [
  // --- Empathize Phase ---
  {
    id: 'empathy-map',
    title: 'Empathy Map',
    description: 'Visualize what users say, think, do, and feel.',
    phase: 'Empathize',
    content: {
      sections: [
        { id: 'userType', label: 'User Type', type: 'text', placeholder: 'e.g. Student, Professional, Admin' },
        { id: 'says', label: 'Says', type: 'textarea', placeholder: 'What are some quotes and defining words?' },
        { id: 'thinks', label: 'Thinks', type: 'textarea', placeholder: 'What is occupying their thoughts?' },
        { id: 'does', label: 'Does', type: 'textarea', placeholder: 'What actions and behaviors have you noticed?' },
        { id: 'feels', label: 'Feels', type: 'textarea', placeholder: 'What emotions might they be feeling?' },
      ]
    }
  },
  {
    id: 'user-persona',
    title: 'User Persona',
    description: 'Create a fictional character that represents your user.',
    phase: 'Empathize',
    content: {
      sections: [
        { id: 'userType', label: 'User Type', type: 'text', placeholder: 'e.g. Student, Professional, Admin' },
        { id: 'name', label: 'Name', type: 'text', placeholder: 'Persona Name' },
        { id: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Short biography' },
        { id: 'age', label: 'Age', type: 'text', placeholder: 'e.g. 25' },
        { id: 'gender', label: 'Gender', type: 'text', placeholder: 'e.g. Female' },
        { id: 'occupation', label: 'Occupation', type: 'text', placeholder: 'e.g. Software Engineer' },
        { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g. San Francisco, CA' },
        { id: 'goals', label: 'Goals', type: 'textarea', placeholder: 'What do they want to achieve?' },
        { id: 'painPoints', label: 'Pain Points', type: 'textarea', placeholder: 'What frustrates them?' },
      ]
    }
  },
  {
    id: 'user-journey-map',
    title: 'User Journey Map',
    description: 'Map out the user\'s experience step-by-step.',
    phase: 'Empathize',
    content: {
      description: 'The editor will initialize default stages and rows.'
    }
  },
  {
    id: 'user-interviews',
    title: 'User Interviews',
    description: 'Structure for conducting and recording user interviews.',
    phase: 'Empathize',
    content: {
      sections: [
        { id: 'userType', label: 'User Type', type: 'text', placeholder: 'e.g. Student, Professional, Admin' },
        { id: 'participant', label: 'Participant Info', type: 'text', placeholder: 'Name/Role' },
        { id: 'notes', label: 'Interview Notes', type: 'textarea', placeholder: 'Key takeaways...' },
        { id: 'quotes', label: 'Key Quotes', type: 'textarea', placeholder: '"..."' },
        { id: 'observations', label: 'Observations', type: 'textarea', placeholder: 'Non-verbal cues...' },
      ]
    }
  },
  {
    id: 'questionnaire',
    title: 'Questionnaire',
    description: 'List of questions to ask during user research.',
    phase: 'Empathize',
    content: {
      sections: [
        { id: 'userType', label: 'User Type', type: 'text', placeholder: 'e.g. Student, Professional, Admin' },
        { id: 'questions', label: 'Questions', type: 'textarea', placeholder: '1. What is your first question?\\n2. What is your second question?\\n...' },
      ]
    }
  },

  // --- Define Phase ---
  {
    id: 'problem-statement',
    title: 'Problem Statement (Customer-Centric)',
    description: 'Define the core problem from the customer\'s perspective.',
    phase: 'Define',
    content: {
      sections: [
        { id: 'user', label: 'User', type: 'text', placeholder: 'Who is the user?' },
        { id: 'need', label: 'Need', type: 'text', placeholder: 'What do they need?' },
        { id: 'insight', label: 'Insight', type: 'textarea', placeholder: 'Because (insight)...' },
        { id: 'statement', label: 'Full Statement', type: 'textarea', placeholder: '[User] needs [Need] because [Insight]' },
      ]
    }
  },
  {
    id: 'user-needs',
    title: 'User Needs Framework',
    description: 'Categorize and prioritize user needs.',
    phase: 'Define',
    content: {
      sections: [
        { id: 'functional', label: 'Functional Needs', type: 'textarea', placeholder: 'What practical things do they need?' },
        { id: 'emotional', label: 'Emotional Needs', type: 'textarea', placeholder: 'How do they want to feel?' },
        { id: 'social', label: 'Social Needs', type: 'textarea', placeholder: 'How do they want to be perceived?' },
      ]
    }
  },

  // --- Ideate Phase ---
  {
    id: 'scamper',
    title: 'SCAMPER',
    description: 'Brainstorming technique: Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse.',
    phase: 'Ideate',
    content: {
      sections: [
        { id: 's', label: 'Substitute', type: 'textarea' },
        { id: 'c', label: 'Combine', type: 'textarea' },
        { id: 'a', label: 'Adapt', type: 'textarea' },
        { id: 'm', label: 'Modify', type: 'textarea' },
        { id: 'p', label: 'Put to another use', type: 'textarea' },
        { id: 'e', label: 'Eliminate', type: 'textarea' },
        { id: 'r', label: 'Reverse', type: 'textarea' },
      ]
    }
  },
  {
    id: 'disrupt',
    title: 'DISRUPT',
    description: 'Lateral thinking technique to generate disruptive ideas.',
    phase: 'Ideate',
    content: {
      sections: [
        { id: 'd', label: 'Derive pattern', type: 'textarea' },
        { id: 'i', label: 'Improve', type: 'textarea' },
        { id: 's', label: 'Shift/Scale', type: 'textarea' },
        { id: 'r', label: 'Reframe/Recycle', type: 'textarea' },
        { id: 'u', label: 'Undo/Unbundle', type: 'textarea' },
        { id: 'p', label: 'Provide/Pause', type: 'textarea' },
        { id: 't', label: 'Touch/Trash', type: 'textarea' },
      ]
    }
  },
  {
    id: 'idea-categorization',
    title: 'Idea Categorization',
    description: 'Sort ideas into categories.',
    phase: 'Ideate',
    content: {
      description: 'The editor will initialize default categories.'
    }
  },
  {
    id: 'hmw-questions',
    title: 'How Might We Questions',
    description: 'Reframe problems as opportunities.\\nFormula: How Might We + Intended Action (as an action verb) + For + Potential User (as the subject) + So That + Desired Outcome',
    phase: 'Ideate',
    content: {
      sections: [
        { id: 'problem', label: 'Core Problem', type: 'text' },
        { id: 'questions', label: 'How Might We Questions', type: 'textarea', placeholder: 'Enter multiple questions separated by Enter...' },
      ]
    }
  },

  // --- Prototype Phase ---
  {
    id: 'paper-prototypes',
    title: 'Paper Prototypes',
    description: 'Sketch out screens and flows. Upload images, annotate, and connect them.',
    phase: 'Prototype',
    content: {
      description: 'The editor will initialize the canvas.'
    }
  },
  {
    id: 'storyboarding',
    title: 'Storyboarding',
    description: 'Visualize the user\'s experience with the solution.',
    phase: 'Prototype',
    content: {
      description: 'The editor will initialize default frames.'
    }
  },

  // --- Test Phase ---
  {
    id: 'usability-testing',
    title: 'Usability Testing Checklist',
    description: 'Prepare for usability testing sessions.',
    phase: 'Test',
    content: {
      sections: [
        { id: 'logistics', label: 'Logistics', type: 'textarea', placeholder: 'Room, Device, Recording setup...' },
        { id: 'scenario', label: 'Test Scenario', type: 'textarea', placeholder: 'Task to give the user...' },
        { id: 'metrics', label: 'Success Metrics', type: 'textarea', placeholder: 'Time to completion, errors...' },
      ]
    }
  },
  {
    id: 'feedback-form',
    title: 'Feedback Form',
    description: 'Collect structured feedback.',
    phase: 'Test',
    content: {
      description: 'The editor will initialize default questions.'
    }
  },
  {
    id: 'user-interviews-validation',
    title: 'User Interviews (Validation)',
    description: 'Validate assumptions with users.',
    phase: 'Test',
    content: {
      sections: [
        { id: 'hypothesis', label: 'Hypothesis', type: 'text', placeholder: 'We believe that...' },
        { id: 'questions', label: 'Validation Questions', type: 'textarea' },
        { id: 'findings', label: 'Findings', type: 'textarea', placeholder: 'Validated or Invalidated?' },
      ]
    }
  },
  {
    id: 'mind-mapping',
    title: 'Mind Mapping',
    description: 'Visually organize information, starting from a central theme.',
    phase: 'Other',
    content: {
      sections: [
        { id: 'central-theme', label: 'Central Theme', type: 'text', placeholder: 'Main idea...' },
        { id: 'branch-1', label: 'Key Branch 1', type: 'textarea', placeholder: 'Sub-topic...' },
        { id: 'branch-2', label: 'Key Branch 2', type: 'textarea', placeholder: 'Sub-topic...' },
        { id: 'branch-3', label: 'Key Branch 3', type: 'textarea', placeholder: 'Sub-topic...' },
        { id: 'connections', label: 'Connections & Insights', type: 'textarea', placeholder: 'Notes on relationships...' }
      ]
    }
  },
  {
    id: 'business-model-canvas',
    title: 'Business Model Canvas',
    description: 'Lean Canvas adaptation for quick business modeling.',
    phase: 'Other',
    content: {
      sections: [
        { id: 'problem', label: 'Problem', type: 'textarea', placeholder: 'Top 3 problems...' },
        { id: 'existing-alternatives', label: 'Existing Alternatives', type: 'textarea', placeholder: 'How are these solved today?' },
        { id: 'solution', label: 'Solution', type: 'textarea', placeholder: 'Top 3 features...' },
        { id: 'key-metrics', label: 'Key Metrics', type: 'textarea', placeholder: 'Key activities you measure...' },
        { id: 'uvp', label: 'Unique Value Proposition', type: 'textarea', placeholder: 'Single, clear, compelling message...' },
        { id: 'high-level-concept', label: 'High-Level Concept', type: 'text', placeholder: 'X for Y analogy...' },
        { id: 'unfair-advantage', label: 'Unfair Advantage', type: 'textarea', placeholder: 'Can\'t be easily copied or bought...' },
        { id: 'channels', label: 'Channels', type: 'textarea', placeholder: 'Path to customers...' },
        { id: 'customer-segments', label: 'Customer Segments', type: 'textarea', placeholder: 'Target customers...' },
        { id: 'early-adopters', label: 'Early Adopters', type: 'textarea', placeholder: 'Characteristics of ideal early customer...' },
        { id: 'cost-structure', label: 'Cost Structure', type: 'textarea', placeholder: 'Fixed and variable costs...' },
        { id: 'revenue-streams', label: 'Revenue Streams', type: 'textarea', placeholder: 'Revenue model, life time value, etc...' }
      ]
    }
  },
  {
    id: 'service-blueprint',
    title: 'Service Blueprint',
    description: 'Visualize organizational processes in order to optimize how a service is delivered.',
    phase: 'Other',
    content: {
      sections: [
        { id: 'physical-evidence', label: 'Physical Evidence / Touch Points', type: 'textarea', placeholder: 'Website, Store, Receipts, Emails...' },
        { id: 'customer-actions', label: 'Customer Actions', type: 'textarea', placeholder: 'Steps the customer takes...' },
        { id: 'customer-emotions', label: 'Customer Emotions', type: 'textarea', placeholder: 'How they feel at each step...' },
        { id: 'frontstage', label: 'Frontstage Actions (Visible)', type: 'textarea', placeholder: 'Employee actions visible to customer...' },
        { id: 'backstage', label: 'Backstage Actions (Invisible)', type: 'textarea', placeholder: 'Employee actions not visible...' },
        { id: 'support-processes', label: 'Support Processes', type: 'textarea', placeholder: 'Internal steps to support the service...' }
      ]
    }
  }
];

// Initialize Helper
const initStorage = () => {
    if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(DEFAULT_TEMPLATES));
    }
};

// Data Access Object
export const storage = {
    // Projects
    getProjects: async () => {
        initStorage();
        const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
        return { data: projects };
    },

    getProject: async (id) => {
        initStorage();
        const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
        const project = projects.find(p => p.id === id);
        if (!project) throw new Error("Project not found");
        return { data: project };
    },

    createProject: async (data) => {
        const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
        const newProject = {
            id: uuidv4(),
            name: data.name,
            description: data.description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        projects.push(newProject);
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
        return { data: newProject };
    },

    deleteProject: async (id) => {
        const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
        const filtered = projects.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
        
        // Cascade delete documents
        const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
        const filteredDocs = documents.filter(d => d.projectId !== id);
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filteredDocs));
        
        return { data: { success: true } };
    },

    // Templates
    getTemplates: async () => {
        initStorage();
        const templates = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEMPLATES) || '[]');
        return { data: templates };
    },
    
    getTemplate: async (id) => {
        initStorage();
        const templates = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEMPLATES) || '[]');
        const template = templates.find(t => t.id === id);
        if (!template) throw new Error("Template not found");
        return { data: template };
    },

    // Documents
    getDocuments: async (projectId) => {
        const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
        const templates = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEMPLATES) || '[]');
        
        // Filter by project and join with template data
        const projectDocs = documents
            .filter(d => d.projectId === projectId)
            .map(d => ({
                ...d,
                template: templates.find(t => t.id === d.templateId)
            }));
            
        return { data: projectDocs };
    },

    getDocument: async (id) => {
        const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
        const doc = documents.find(d => d.id === id);
        if (!doc) throw new Error("Document not found");

        const templates = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEMPLATES) || '[]');
        const template = templates.find(t => t.id === doc.templateId);
        
        const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
        const project = projects.find(p => p.id === doc.projectId);

        return { data: { ...doc, template, project } };
    },

    createDocument: async (data) => {
        const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
        const newDoc = {
            id: uuidv4(),
            projectId: data.projectId,
            templateId: data.templateId,
            content: JSON.stringify(data.content),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        documents.push(newDoc);
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
        return { data: newDoc };
    },

    updateDocument: async (id, data) => {
        const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
        const index = documents.findIndex(d => d.id === id);
        if (index === -1) throw new Error("Document not found");

        documents[index] = {
            ...documents[index],
            content: JSON.stringify(data.content),
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
        return { data: documents[index] };
    },

    deleteDocument: async (id) => {
        const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
        const filtered = documents.filter(d => d.id !== id);
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filtered));
        return { data: { success: true } };
    }
};

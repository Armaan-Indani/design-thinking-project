const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Fix for "Unknown property datasourceUrl" is handled by just using default constructor
// if env var is set correctly, which it is.
const prisma = new PrismaClient();

const templates = [
  // --- Empathize Phase ---
  {
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
    title: 'User Persona',
    description: 'Create a fictional character that represents your user.',
    phase: 'Empathize',
    content: {
      sections: [
        { id: 'userType', label: 'User Type', type: 'text', placeholder: 'e.g. Student, Professional, Admin' },
        { id: 'name', label: 'Name', type: 'text', placeholder: 'Persona Name' },
        { id: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Short biography' },
        { id: 'demographics', label: 'Demographics', type: 'text', placeholder: 'Age, Occupation, Location' },
        { id: 'goals', label: 'Goals', type: 'textarea', placeholder: 'What do they want to achieve?' },
        { id: 'painPoints', label: 'Pain Points', type: 'textarea', placeholder: 'What frustrates them?' },
      ]
    }
  },
  {
    title: 'User Journey Map',
    description: 'Map out the user\'s experience step-by-step.',
    phase: 'Empathize',
    content: {
      // Custom editor manages the structure internally (grid object)
      description: 'The editor will initialize default stages and rows.'
    }
  },
  {
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
    title: 'Questionnaire',
    description: 'List of questions to ask during user research.',
    phase: 'Empathize',
    content: {
      sections: [
        { id: 'userType', label: 'User Type', type: 'text', placeholder: 'e.g. Student, Professional, Admin' },
        { id: 'questions', label: 'Questions', type: 'textarea', placeholder: '1. What is your first question?\n2. What is your second question?\n...' },
      ]
    }
  },

  // --- Define Phase ---
  {
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
    title: 'Idea Categorization',
    description: 'Sort ideas into categories.',
    phase: 'Ideate',
    content: {
      // Custom editor manages the structure internally (categories array)
      description: 'The editor will initialize default categories.'
    }
  },
  {
    title: 'How Might We Questions',
    description: 'Reframe problems as opportunities.\nFormula: How Might We + Intended Action (as an action verb) + For + Potential User (as the subject) + So That + Desired Outcome',
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
    title: 'Paper Prototypes',
    description: 'Sketch out screens and flows.',
    phase: 'Prototype',
    content: {
      sections: [
        { id: 'screen1', label: 'Screen 1', type: 'textarea', placeholder: 'Describe layout and key elements...' },
        { id: 'flow1', label: 'Interaction Flow', type: 'textarea', placeholder: 'What happens next?' },
        { id: 'screen2', label: 'Screen 2', type: 'textarea' },
      ]
    }
  },
  {
    title: 'Storyboarding',
    description: 'Visualize the user\'s experience with the solution.',
    phase: 'Prototype',
    content: {
      sections: [
        { id: 'panel1', label: 'Scene 1: Context', type: 'textarea', placeholder: 'Setting the scene...' },
        { id: 'panel2', label: 'Scene 2: Problem', type: 'textarea', placeholder: 'User encounters problem...' },
        { id: 'panel3', label: 'Scene 3: Solution', type: 'textarea', placeholder: 'Using the prototype...' },
        { id: 'panel4', label: 'Scene 4: Outcome', type: 'textarea', placeholder: 'Success/Resolution...' },
      ]
    }
  },

  // --- Test Phase ---
  {
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
    title: 'Feedback Form',
    description: 'Collect structured feedback.',
    phase: 'Test',
    content: {
      sections: [
        { id: 'likes', label: 'What did they like?', type: 'textarea' },
        { id: 'dislikes', label: 'What did they dislike?', type: 'textarea' },
        { id: 'confusion', label: 'What was confusing?', type: 'textarea' },
        { id: 'requests', label: 'Feature requests', type: 'textarea' },
      ]
    }
  },
  {
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
  }
];

async function main() {
  console.log('Start seeding ...');
  for (const t of templates) {
    // Check duplication by title AND phase to allow similar names in different phases
    const existing = await prisma.template.findFirst({
      where: { 
        title: t.title,
        phase: t.phase
      }
    });
    
    if (!existing) {
      const template = await prisma.template.create({
        data: {
          title: t.title,
          description: t.description,
          phase: t.phase,
          content: JSON.stringify(t.content),
        },
      });
      console.log(`Created template: ${template.title} (${template.phase})`);
    } else {
      console.log(`Updating existing template: ${t.title} (${t.phase})`);
      await prisma.template.update({
        where: { id: existing.id },
        data: {
          content: JSON.stringify(t.content),
          description: t.description
        }
      });
    }
  }
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

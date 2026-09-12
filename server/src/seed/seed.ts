import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Note } from '../models/Note';
import { Tag } from '../models/Tag';

export async function seedDatabase() {
  console.log('[Seeder] Starting database seed...');
  await connectDB();

  // Clear existing demo user and demo data
  const demoEmail = 'demo@notely.app';
  const existingUser = await User.findOne({ email: demoEmail });
  if (existingUser) {
    await Note.deleteMany({ user: existingUser._id });
    await Tag.deleteMany({ user: existingUser._id });
    await User.findByIdAndDelete(existingUser._id);
  }

  // 1. Create Demo User
  const demoUser = await User.create({
    name: 'Alex Morgan',
    email: demoEmail,
    password: 'Password123!',
    themePreference: 'system',
    editorPreferences: {
      defaultMode: 'edit',
      autoSaveDelay: 1000,
      density: 'comfortable',
    },
  });

  console.log(`[Seeder] Created demo user: ${demoUser.email}`);

  // 2. Create Tags
  const tagsList = ['react', 'architecture', 'design', 'ideas', 'work', 'roadmap', 'meeting'];
  const createdTags = await Promise.all(
    tagsList.map((name) => Tag.create({ user: demoUser._id, name }))
  );
  console.log(`[Seeder] Created ${createdTags.length} tags`);

  // 3. Create Sample Notes
  const sampleNotes = [
    {
      user: demoUser._id,
      title: 'Welcome to Notely 🚀',
      content: `# Welcome to Notely

Notely is a production-grade personal productivity workspace designed for speed, clarity, and focus.

### ✨ Key Features:
- **Markdown Editor**: Full support for headings, bold, italics, checklists, and syntax-highlighted code blocks.
- **Auto-Save Engine**: Never lose a thought—drafts save seamlessly with debounced synchronization.
- **Omnisearch (\`Ctrl+K\`)**: Instant fuzzy search across titles, contents, and tags.
- **Color Coding**: Visual categorization with soft pastel accents.
- **Keyboard Shortcuts**: Speed up your workflow with \`Ctrl+B\`, \`Ctrl+I\`, \`Ctrl+S\`, and \`Ctrl+N\`.

> *"Capture ideas. Organize everything. Find anything."*`,
      tags: ['ideas', 'roadmap'],
      color: 'emerald',
      isFavorite: true,
      isPinned: true,
      isArchived: false,
    },
    {
      user: demoUser._id,
      title: 'React 19 & Full-Stack Architecture Best Practices',
      content: `## Architecture Principles for Scalable Web Apps

When building modern React applications, strict separation of concerns and smart server-state caching are critical.

### 1. State Separation
- **Server State**: Managed via *TanStack Query* (caching, deduplication, optimistic mutations).
- **Client State**: Local state with \`useState\` and light context for theme/session.

### 2. Optimistic UI Updates
\`\`\`typescript
const mutation = useMutation({
  mutationFn: toggleFavoriteApi,
  onMutate: async (note) => {
    // Cancel queries and update cache optimistically
    await queryClient.cancelQueries({ queryKey: ['notes'] });
    const prev = queryClient.getQueryData(['notes']);
    queryClient.setQueryData(['notes'], (old) => updateNoteInList(old, note._id));
    return { prev };
  },
  onError: (err, note, context) => {
    // Rollback cache on failure
    queryClient.setQueryData(['notes'], context.prev);
  }
});
\`\`\`

### 3. Key Checklist
- [x] Code splitting with React.lazy and Suspense
- [x] Debounced search queries
- [x] Accessible dialogs and keyboard navigation
- [ ] Implement service worker caching`,
      tags: ['react', 'architecture'],
      color: 'sky',
      isFavorite: true,
      isPinned: true,
      isArchived: false,
    },
    {
      user: demoUser._id,
      title: 'Product Design System & Token Guidelines',
      content: `## Design Tokens & Typography

Our design philosophy focuses on restraint, crisp typography, and subtle micro-interactions.

### Color Palette Guidelines
- **Primary**: Emerald green (\`#16a34a\`) for positive focus and actions.
- **Backgrounds**: Pure white for light mode, deep slate-zinc for dark mode.
- **Borders**: Subtle 1px borders instead of heavy box shadows.

### Checklist
- [x] Implement system theme detection
- [x] Ensure 4.5:1 minimum WCAG contrast
- [x] Responsive layout with collapsible sidebar and mobile drawer`,
      tags: ['design', 'work'],
      color: 'violet',
      isFavorite: false,
      isPinned: false,
      isArchived: false,
    },
    {
      user: demoUser._id,
      title: 'Sprint Planning & Team Roadmap Q3',
      content: `## Q3 Sprint Goals & Deliverables

### Priority Deliverables
1. **Search Performance**: Sub-50ms search index querying.
2. **Tag Hierarchy**: Bulk tag renaming and multi-tag filtering.
3. **Export Formats**: Support PDF and raw Markdown zip exports.

### Action Items
- [x] Review API rate limits
- [x] Setup MongoDB compound index on \`{ user: 1, updatedAt: -1 }\`
- [ ] Polish mobile drawer touch interactions`,
      tags: ['meeting', 'roadmap', 'work'],
      color: 'amber',
      isFavorite: true,
      isPinned: false,
      isArchived: false,
    },
    {
      user: demoUser._id,
      title: 'Archived: Legacy Product Brainstorming',
      content: `## Brainstorming Session Archive

Notes and raw ideas from earlier product ideation sessions. Kept in archive for historical context.`,
      tags: ['ideas'],
      color: 'rose',
      isFavorite: false,
      isPinned: false,
      isArchived: true,
    },
  ];

  await Note.insertMany(sampleNotes);
  console.log(`[Seeder] Created ${sampleNotes.length} sample notes`);

  console.log('[Seeder] Database seeding completed successfully!');
  console.log('----------------------------------------------------');
  console.log('Demo Credentials:');
  console.log('Email:    demo@notely.app');
  console.log('Password: Password123!');
  console.log('----------------------------------------------------');
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Seeder Error]:', err);
      await disconnectDB();
      process.exit(1);
    });
}

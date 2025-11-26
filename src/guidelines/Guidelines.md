# Acervo Digital - Guidelines

## General Guidelines

- Use absolute positioning only when necessary. Opt for responsive and well-structured layouts that use flexbox and grid by default
- Refactor code as you go to keep code clean
- Keep file sizes small and put helper functions and components in their own files
- Use sticky navigation with floating (suspended) design
- All interactive elements should have hover states with smooth transitions

## Design System

### Typography

- Base font-size: 14px
- Font family: Nunito
- Text should be left-aligned by default
- Headings use font-weight: extrabold (800) to black (900)
- Body text uses font-weight: regular (400) to semibold (600)

### Colors

- Primary: rgba(99, 102, 241, 1.00) - Indigo
- Secondary: rgba(236, 72, 153, 1.00) - Pink
- Accent: rgba(168, 85, 247, 1.00) - Purple
- Use vibrant gradients combining primary, purple, and pink colors
- Background: Light gray (bg-gray-50) for clean, modern appearance

### Navigation

- Sticky top navigation with floating/suspended design (sticky top-0 z-50)
- Thin, compact height (h-[60px]) with rounded corners (rounded-3xl)
- Suspended from edges with outer padding (px-4 pt-4)
- Logo and brand name "Acervo Digital" aligned to left side
- Logo icon: BookOpen (represents educational/pedagogical digital content)
- Logo container: glassmorphism effect with hover animation (scale and rotate)
- Search bar and profile menu aligned to right
- Gradient background: from-primary via-purple-600 to-pink-600
- Glassmorphism effects on all interactive elements
- Shadow elevation (shadow-2xl)
- Mobile menu integrates within the rounded container

### Cards (Project Cards)

- Horizontal aspect ratio (16:9) for images
- Glassmorphism effect with backdrop-blur-xl
- Border-radius: rounded-3xl
- Uniform height across all cards in grid
- Must include comprehensive hover states:
  - Translate up: `hover:-translate-y-3`
  - Scale up: `hover:scale-[1.02]`
  - Enhanced shadows: `hover:shadow-2xl hover:shadow-primary/40`
  - Border color intensification: `hover:border-primary/60`
  - Image zoom and brightness: `hover:scale-115 hover:brightness-110 hover:saturate-110`
  - Tag scale animation: `group-hover:scale-110`
  - Icon rotation effects: `group-hover:rotate-12`
  - Category badge scale: `group-hover:scale-105`
  - Duration badge scale: `group-hover:scale-110`
  - Gradient overlay intensification on hover
- Tag colors for curriculum components (different from marca colors):
  - Língua Portuguesa: Green (bg-green-100 text-green-700 border-green-200)
  - Matemática: Blue (bg-blue-100 text-blue-700 border-blue-200)
  - Ciências: Teal (bg-teal-100 text-teal-700 border-teal-200)
  - História: Amber (bg-amber-100 text-amber-700 border-amber-200)
  - Geografia: Cyan (bg-cyan-100 text-cyan-700 border-cyan-200)
  - Arte: Violet (bg-violet-100 text-violet-700 border-violet-200)
  - Inglês: Indigo (bg-indigo-100 text-indigo-700 border-indigo-200)
  - Educação Física: Lime (bg-lime-100 text-lime-700 border-lime-200)
- Marca colors (different from curriculum components):
  - SPE: Orange/Secondary (bg-secondary/10 text-secondary border-secondary/20)
  - SAE: Purple (bg-purple-100 text-purple-700 border-purple-200)
  - CQT: Pink (bg-pink-100 text-pink-700 border-pink-200)

### Filter Sidebar

- Rounded container with glassmorphism (rounded-3xl)
- Suspended design with padding wrapper
- All filter sections collapsed by default
- Compact checkboxes (w-4 h-4)
- Color-coded filter categories with gradients

### Buttons & Interactive Elements

- Primary actions use gradient backgrounds
- All buttons should have hover states with:
  - Scale transformation (scale-105 to scale-125)
  - Shadow enhancement
  - Optional rotation effects for playful interactions
- Transition duration: 300ms for most interactions, 500-700ms for complex animations

### Spacing

- Use consistent spacing scale (gap-2, gap-3, gap-4, etc.)
- Cards grid gap: gap-5
- Section spacing: space-y-5 to space-y-6

### Accessibility

- All interactive elements must have focus states
- Color contrast must meet WCAG AA standards
- Icons paired with descriptive text where appropriate

## Component Guidelines

### ProjectCard Component

- Required props: project, onClick, isFavorite, onToggleFavorite
- Show favorite heart button on all cards
- Volume badge in top-right
- Favorite button in top-left
- Tags limited to 3 maximum (from tags array)
- Marca badge displayed after tags with indigo/violet gradient and border
- Category badge with gradient text
- Year/grade and duration badges at bottom

### Navigation Component

- Responsive design with mobile menu
- Profile dropdown with glassmorphism effect
- Smooth transitions for all interactive states

### FilterSidebar Component

- Collapsible sections for each filter category
- Color-coded visual feedback for selected filters
- "Clear Filters" button appears when filters are active
- Total active filter count display
- Active filters display section showing removable badges/chips
- Each active filter has individual remove button (X icon with rotation animation)
- Badges color-coded by category:
  - Categorias: purple/primary gradient
  - Anos: blue/cyan gradient
  - Componente Curricular: purple/pink gradient
  - BNCC Codes: green/emerald gradient (with monospace font)
  - Livros: orange/amber gradient
  - Marcas: indigo/violet gradient
  - Tipo de Objeto Digital: fuchsia/pink gradient
- Filter categories include:
  - Tipo de Conteúdo (Vídeo Aula, Jogo Digital)
  - Ano/série (1º ao 5º ano)
  - Componente Curricular (Língua Portuguesa, Matemática, Ciências, História, Geografia, Arte, Inglês, Educação Física)
  - Código BNCC (códigos específicos da BNCC)
  - Livros (nomes dos livros didáticos)
  - Marcas (CQT, SAE, SPE)
  - Tipo de Objeto Digital (Quiz, Apontar e Clicar, Clicar e Arrastar, Vídeo Interativo, Simulação, Jogo Educativo)

## Visual Appearance

- Light mode only with clean, modern design
- Light gray background (bg-gray-50) throughout the application
- Glassmorphism effects with backdrop-blur for depth
- Vibrant gradients for accents and interactive elements
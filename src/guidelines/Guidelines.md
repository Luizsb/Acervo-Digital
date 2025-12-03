# Acervo Digital - Diretrizes

## Diretrizes Gerais

- Use posicionamento absoluto apenas quando necessário. Opte por layouts responsivos e bem estruturados que usem flexbox e grid por padrão
- Refatore o código conforme avança para manter o código limpo
- Mantenha os arquivos pequenos e coloque funções auxiliares e componentes em seus próprios arquivos
- Use navegação fixa com design flutuante (suspenso)
- Todos os elementos interativos devem ter estados de hover com transições suaves

## Sistema de Design

### Tipografia

- Tamanho de fonte base: 14px
- Família de fonte: Nunito
- O texto deve ser alinhado à esquerda por padrão
- Títulos usam font-weight: extrabold (800) a black (900)
- Texto do corpo usa font-weight: regular (400) a semibold (600)

### Cores

- Primária: rgba(99, 102, 241, 1.00) - Índigo
- Secundária: rgba(236, 72, 153, 1.00) - Rosa
- Destaque: rgba(168, 85, 247, 1.00) - Roxo
- Use gradientes vibrantes combinando cores primária, roxa e rosa
- Fundo: Cinza claro (bg-gray-50) para aparência limpa e moderna

### Navegação

- Navegação superior fixa com design flutuante/suspenso (sticky top-0 z-50)
- Altura fina e compacta (h-[60px]) com cantos arredondados (rounded-3xl)
- Suspensa das bordas com padding externo (px-4 pt-4)
- Logo e nome da marca "Acervo Digital" alinhados ao lado esquerdo
- Ícone do logo: BookOpen (representa conteúdo digital educacional/pedagógico)
- Container do logo: efeito glassmorphism com animação hover (escala e rotação)
- Barra de pesquisa e menu de perfil alinhados à direita
- Fundo em gradiente: from-primary via-purple-600 to-pink-600
- Efeitos glassmorphism em todos os elementos interativos
- Elevação de sombra (shadow-2xl)
- Menu mobile integrado dentro do container arredondado

### Cards (Cards de Projeto)

- Proporção horizontal (16:9) para imagens
- Efeito glassmorphism com backdrop-blur-xl
- Border-radius: rounded-3xl
- Altura uniforme em todos os cards da grade
- Deve incluir estados de hover abrangentes:
  - Translação para cima: `hover:-translate-y-3`
  - Escala para cima: `hover:scale-[1.02]`
  - Sombras aprimoradas: `hover:shadow-2xl hover:shadow-primary/40`
  - Intensificação da cor da borda: `hover:border-primary/60`
  - Zoom e brilho da imagem: `hover:scale-115 hover:brightness-110 hover:saturate-110`
  - Animação de escala da tag: `group-hover:scale-110`
  - Efeitos de rotação do ícone: `group-hover:rotate-12`
  - Escala do badge de categoria: `group-hover:scale-105`
  - Escala do badge de duração (apenas para Vídeo Aula): `group-hover:scale-110`
  - Intensificação da sobreposição de gradiente no hover
- Cores das tags para componentes curriculares (diferentes das cores de marca):
  - Língua Portuguesa: Verde (bg-green-100 text-green-700 border-green-200)
  - Matemática: Azul (bg-blue-100 text-blue-700 border-blue-200)
  - Ciências: Verde-azulado (bg-teal-100 text-teal-700 border-teal-200)
  - História: Âmbar (bg-amber-100 text-amber-700 border-amber-200)
  - Geografia: Ciano (bg-cyan-100 text-cyan-700 border-cyan-200)
  - Arte: Violeta (bg-violet-100 text-violet-700 border-violet-200)
  - Inglês: Índigo (bg-indigo-100 text-indigo-700 border-indigo-200)
  - Educação Física: Lima (bg-lime-100 text-lime-700 border-lime-200)
- Cores de marca (diferentes dos componentes curriculares):
  - SPE: Laranja/Secundária (bg-secondary/10 text-secondary border-secondary/20)
  - SAE: Roxo (bg-purple-100 text-purple-700 border-purple-200)
  - CQT: Rosa (bg-pink-100 text-pink-700 border-pink-200)

### Barra Lateral de Filtros

- Container arredondado com glassmorphism (rounded-3xl)
- Design suspenso com wrapper de padding
- Todas as seções de filtro recolhidas por padrão
- Checkboxes compactos (w-4 h-4)
- Categorias de filtro codificadas por cores com gradientes

### Botões e Elementos Interativos

- Ações primárias usam fundos em gradiente
- Todos os botões devem ter estados de hover com:
  - Transformação de escala (scale-105 a scale-125)
  - Aprimoramento de sombra
  - Efeitos de rotação opcionais para interações lúdicas
- Duração da transição: 300ms para a maioria das interações, 500-700ms para animações complexas

### Espaçamento

- Use escala de espaçamento consistente (gap-2, gap-3, gap-4, etc.)
- Espaçamento da grade de cards: gap-5
- Espaçamento de seção: space-y-5 a space-y-6

### Acessibilidade

- Todos os elementos interativos devem ter estados de foco
- O contraste de cores deve atender aos padrões WCAG AA
- Ícones acompanhados de texto descritivo quando apropriado

## Diretrizes de Componentes

### Componente ProjectCard

- Props obrigatórias: project, onClick, isFavorite, onToggleFavorite
- Mostrar botão de coração de favorito em todos os cards
- Badge de volume no canto superior direito
- Botão de favorito no canto superior esquerdo
- Tags limitadas a no máximo 3 (do array de tags)
- Badge de marca exibido após as tags com gradiente índigo/violeta e borda
- Badge de categoria com texto em gradiente
- Badges de ano/série na parte inferior
- Badge de duração apenas para Vídeo Aula (contentType === 'Audiovisual' e category/videoCategory === 'Vídeo Aula')

### Componente Navigation

- Design responsivo com menu mobile
- Dropdown de perfil com efeito glassmorphism
- Transições suaves para todos os estados interativos

### Componente FilterSidebar

- Seções recolhíveis para cada categoria de filtro
- Feedback visual codificado por cores para filtros selecionados
- Botão "Limpar Filtros" aparece quando os filtros estão ativos
- Exibição da contagem total de filtros ativos
- Seção de exibição de filtros ativos mostrando badges/chips removíveis
- Cada filtro ativo tem botão de remoção individual (ícone X com animação de rotação)
- Badges codificados por cores por categoria:
  - Categorias: gradiente roxo/primário
  - Anos: gradiente azul/ciano
  - Componente Curricular: gradiente roxo/rosa
  - Códigos BNCC: gradiente verde/esmeralda (com fonte monoespaçada)
  - Segmentos: gradiente laranja/âmbar
  - Marcas: gradiente índigo/violeta
  - Tipo de Objeto Digital: gradiente fúcsia/rosa
- Categorias de filtro incluem:
  - Tipo de Conteúdo (Vídeo Aula, Objeto Digital)
  - Ano/série (1º ao 5º ano)
  - Componente Curricular (Língua Portuguesa, Matemática, Ciências, História, Geografia, Arte, Inglês, Educação Física)
  - Código BNCC (códigos específicos da BNCC)
  - Segmentos (segmentos educacionais)
  - Marcas (CQT, SAE, SPE)
  - Tipo de Objeto Digital (Quiz, Apontar e Clicar, Clicar e Arrastar, Vídeo Interativo, Simulação, Jogo Educativo)

## Aparência Visual

- Apenas modo claro com design limpo e moderno
- Fundo cinza claro (bg-gray-50) em toda a aplicação
- Efeitos glassmorphism com backdrop-blur para profundidade
- Gradientes vibrantes para destaques e elementos interativos
import { useState, useMemo, useCallback } from 'react';
import type { ODAFromExcel } from '../types/project';
import { getComponentFullName, getSegmentFullName, sortSegments, getMarcaFullName } from '../utils/curriculumColors';
import { extractBnccCode, extractBnccDescription } from '../utils/formatters';

export interface SelectedFilters {
  anos: string[];
  tags: string[];
  bnccCodes: string[];
  segmentos: string[];
  categorias: string[];
  marcas: string[];
  tipoObjeto: string[];
  videoCategory: string[];
  samr: string[];
  volumes: string[];
  vestibular: string[];
  capitulo: string[];
  macroformatos: string[];
  colecoes: string[];
  livros: string[];
  blocos: string[];
  palavrasChave: string[];
  enviosEscola: string[];
  usuariosPrincipais: string[];
}

export const initialSelectedFilters: SelectedFilters = {
  anos: [],
  tags: [],
  bnccCodes: [],
  segmentos: [],
  categorias: [],
  marcas: [],
  tipoObjeto: [],
  videoCategory: [],
  samr: [],
  volumes: [],
  vestibular: [],
  capitulo: [],
  macroformatos: [],
  colecoes: [],
  livros: [],
  blocos: [],
  palavrasChave: [],
  enviosEscola: [],
  usuariosPrincipais: [],
};

export interface FilterOptions {
  anos: string[];
  tags: string[];
  bnccCodes: string[];
  bnccDescriptions: Record<string, string>;
  segmentos: string[];
  categorias: string[];
  marcas: string[];
  tipoObjeto: string[];
  videoCategory: string[];
  samr: string[];
  volumes: string[];
  vestibular: string[];
  capitulo: string[];
  macroformatos: string[];
  colecoes: string[];
  livros: string[];
  blocos: string[];
  palavrasChave: string[];
  enviosEscola: string[];
  usuariosPrincipais: string[];
}

function normalizeAnoKey(ano: string): string {
  if (!ano) return '';
  return ano.trim().replace(/[°ºo]/gi, '°').replace(/\s+/g, ' ').toLowerCase();
}

export function useProjectFilters(
  projects: ODAFromExcel[],
  contentTypeFilter: 'Todos' | 'Audiovisual' | 'OED',
  searchQuery: string
) {
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(initialSelectedFilters);

  const contentTypeFilteredProjects = useMemo(() => {
    return contentTypeFilter === 'Todos'
      ? projects
      : projects.filter((p) => p.contentType === contentTypeFilter);
  }, [projects, contentTypeFilter]);

  const filterOptions = useMemo((): FilterOptions => {
    const anosMap = new Map<string, string>();
    contentTypeFilteredProjects.forEach((p) => {
      if (p.location) {
        const normalizedKey = normalizeAnoKey(p.location);
        if (normalizedKey && !anosMap.has(normalizedKey)) anosMap.set(normalizedKey, p.location);
      }
    });
    const anosUnicos = Array.from(anosMap.values()).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b, 'pt-BR');
    });

    return {
      anos: anosUnicos,
      tags: Array.from(
        new Set(
          contentTypeFilteredProjects
            .flatMap((p) => {
              const rawTags = p.tags?.length ? p.tags : p.tag ? [p.tag] : [];
              return rawTags.filter(Boolean).map((tag) => getComponentFullName(tag));
            })
            .filter(Boolean)
        )
      ).sort(),
      bnccCodes: Array.from(
        new Set(
          contentTypeFilteredProjects
            .flatMap((p) => [extractBnccCode(p.bnccCode), extractBnccCode(p.bnccCodeSecondary)])
            .filter((code) => Boolean(code))
        )
      ).sort(),
      bnccDescriptions: (() => {
        const map: Record<string, string> = {};
        contentTypeFilteredProjects.forEach((p) => {
          const primary = extractBnccCode(p.bnccCode);
          const primaryDesc = extractBnccDescription(p.bnccCode, p.bnccDescription);
          if (primary && primaryDesc && !map[primary]) map[primary] = primaryDesc;
          const secondary = extractBnccCode(p.bnccCodeSecondary);
          const secondaryDesc = extractBnccDescription(p.bnccCodeSecondary, p.bnccDescriptionSecondary);
          if (secondary && secondaryDesc && !map[secondary]) map[secondary] = secondaryDesc;
        });
        return map;
      })(),
      segmentos: sortSegments(
        Array.from(
          new Set(
            contentTypeFilteredProjects
              .map((p) => p.segmento)
              .filter(Boolean)
              .map((seg) => getSegmentFullName(seg || ''))
          )
        )
      ) as string[],
      categorias: Array.from(
        new Set(
          contentTypeFilteredProjects
            .map((p) => p.category)
            .filter((cat): cat is string => Boolean(cat))
        )
      ).sort(),
      marcas: Array.from(
        new Set(
          contentTypeFilteredProjects
            .map((p) => p.marca)
            .filter(Boolean)
            .map((marca) => getMarcaFullName(marca || ''))
        )
      ).sort(),
      tipoObjeto: Array.from(
        new Set(
          contentTypeFilteredProjects
            .map((p) => p.tipoObjeto)
            .filter((t): t is string => Boolean(t))
        )
      ).sort(),
      macroformatos: Array.from(
        new Set(
          contentTypeFilteredProjects
            .map((p) => p.macroformato)
            .filter((t): t is string => Boolean(t))
        )
      ).sort(),
      colecoes: Array.from(
        new Set(
          contentTypeFilteredProjects
            .map((p) => p.colecao)
            .filter((t): t is string => Boolean(t))
        )
      ).sort((a, b) => a.localeCompare(b, 'pt-BR')),
      livros: Array.from(
        new Set(
          contentTypeFilteredProjects
            .map((p) => p.livro)
            .filter((t): t is string => Boolean(t))
        )
      ).sort((a, b) => a.localeCompare(b, 'pt-BR')),
      blocos: Array.from(
        new Set(
          contentTypeFilteredProjects
            .map((p) => p.blocoCapitulo)
            .filter((t): t is string => Boolean(t))
        )
      ).sort((a, b) => a.localeCompare(b, 'pt-BR')),
      palavrasChave: Array.from(
        new Set(
          contentTypeFilteredProjects.flatMap((p) => p.palavrasChave || []).filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b, 'pt-BR')),
      enviosEscola: Array.from(
        new Set(
          contentTypeFilteredProjects
            .map((p) => p.envioEscola)
            .filter((t): t is string => Boolean(t))
        )
      ).sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true })),
      usuariosPrincipais: Array.from(
        new Set(
          contentTypeFilteredProjects
            .map((p) => p.usuarioPrincipal)
            .filter((t): t is string => Boolean(t))
        )
      ).sort((a, b) => a.localeCompare(b, 'pt-BR')),
      videoCategory: Array.from(
        new Set(
          contentTypeFilteredProjects
            .filter((p) => p.contentType === 'Audiovisual')
            .map((p) => p.videoCategory)
            .filter((cat): cat is string => Boolean(cat))
        )
      ).sort(),
      samr: Array.from(
        new Set(
          contentTypeFilteredProjects
            .map((p) => p.samr)
            .filter((s): s is string => Boolean(s))
        )
      ).sort(),
      volumes: Array.from(
        new Set(
          contentTypeFilteredProjects
            .map((p) => p.volume)
            .filter((v): v is string => Boolean(v))
        )
      ).sort(),
      vestibular: Array.from(
        new Set(
          contentTypeFilteredProjects
            .filter((p) => p.contentType === 'Audiovisual' && 'vestibular' in p)
            .map((p) => (p as ODAFromExcel & { vestibular?: string }).vestibular)
            .filter((v): v is string => Boolean(v))
        )
      ).sort(),
      capitulo: Array.from(
        new Set(
          contentTypeFilteredProjects
            .filter((p) => p.contentType === 'Audiovisual' && 'capitulo' in p)
            .map((p) => (p as ODAFromExcel & { capitulo?: string }).capitulo)
            .filter((v): v is string => Boolean(v))
        )
      ).sort(),
    };
  }, [contentTypeFilteredProjects]);

  const filteredProjects = useMemo(() => {
    return contentTypeFilteredProjects.filter((project) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        project.title.toLowerCase().includes(q) ||
        project.tag.toLowerCase().includes(q) ||
        (project.location?.toLowerCase() || '').includes(q) ||
        (project.bnccCode?.toLowerCase() || '').includes(q) ||
        (project.bnccCodeSecondary?.toLowerCase() || '').includes(q) ||
        (project.codigoODA?.toLowerCase() || '').includes(q) ||
        (project.category?.toLowerCase() || '').includes(q) ||
        (project.macroformato?.toLowerCase() || '').includes(q) ||
        (project.volume?.toLowerCase() || '').includes(q) ||
        (project.segmento?.toLowerCase() || '').includes(q) ||
        (project.marca?.toLowerCase() || '').includes(q) ||
        (project.colecao?.toLowerCase() || '').includes(q) ||
        (project.blocoCapitulo?.toLowerCase() || '').includes(q) ||
        (project.usuarioPrincipal?.toLowerCase() || '').includes(q) ||
        (project.palavrasChave || []).some((k) => k.toLowerCase().includes(q)) ||
        (project.tags || []).some((tag) => tag.toLowerCase().includes(q)) ||
        ((project as ODAFromExcel & { vestibular?: string }).vestibular?.toLowerCase() || '').includes(q) ||
        ((project as ODAFromExcel & { capitulo?: string }).capitulo?.toLowerCase() || '').includes(q) ||
        ((project as ODAFromExcel & { enunciado?: string }).enunciado?.toLowerCase() || '').includes(q) ||
        ((project as ODAFromExcel & { nomeCapitulo?: string }).nomeCapitulo?.toLowerCase() || '').includes(q);

      const matchesAnos =
        selectedFilters.anos.length === 0 ||
        (project.location &&
          selectedFilters.anos.some(
            (selectedAno) =>
              normalizeAnoKey(selectedAno) === normalizeAnoKey(project.location)
          ));

      const matchesTags =
        selectedFilters.tags.length === 0 ||
        selectedFilters.tags.some((selectedTag) => {
          const selectedTagFull = getComponentFullName(selectedTag);
          const projectTags = (project.tags || []).map((t) => getComponentFullName(t));
          const projectTagFull = project.tag ? getComponentFullName(project.tag) : '';
          return projectTags.includes(selectedTagFull) || projectTagFull === selectedTagFull;
        });

      const matchesBNCC =
        selectedFilters.bnccCodes.length === 0 ||
        selectedFilters.bnccCodes.some((c) => {
          const code = extractBnccCode(c) || c.trim();
          return extractBnccCode(project.bnccCode) === code || extractBnccCode(project.bnccCodeSecondary) === code;
        });

      const matchesSegmentos =
        selectedFilters.segmentos.length === 0 ||
        (project.segmento &&
          selectedFilters.segmentos.some(
            (selectedSegment) =>
              getSegmentFullName(selectedSegment) === getSegmentFullName(project.segmento || '')
          ));

      const matchesCategorias =
        selectedFilters.categorias.length === 0 ||
        (project.category && selectedFilters.categorias.includes(project.category));

      const matchesMarcas =
        selectedFilters.marcas.length === 0 ||
        (project.marca &&
          selectedFilters.marcas.some(
            (selectedMarca) =>
              getMarcaFullName(selectedMarca) === getMarcaFullName(project.marca || '')
          ));

      const matchesTipoObjeto =
        selectedFilters.tipoObjeto.length === 0 ||
        Boolean(project.tipoObjeto && selectedFilters.tipoObjeto.includes(project.tipoObjeto));

      const matchesMacroformato =
        selectedFilters.macroformatos.length === 0 ||
        Boolean(project.macroformato && selectedFilters.macroformatos.includes(project.macroformato));

      const matchesColecoes =
        selectedFilters.colecoes.length === 0 ||
        Boolean(project.colecao && selectedFilters.colecoes.includes(project.colecao));

      const matchesLivros =
        selectedFilters.livros.length === 0 ||
        Boolean(project.livro && selectedFilters.livros.includes(project.livro));

      const matchesBlocos =
        selectedFilters.blocos.length === 0 ||
        Boolean(project.blocoCapitulo && selectedFilters.blocos.includes(project.blocoCapitulo));

      const matchesPalavrasChave =
        selectedFilters.palavrasChave.length === 0 ||
        selectedFilters.palavrasChave.some((kw) =>
          (project.palavrasChave || []).some((p) => p.toLowerCase() === kw.toLowerCase())
        );

      const matchesEnviosEscola =
        selectedFilters.enviosEscola.length === 0 ||
        Boolean(project.envioEscola && selectedFilters.enviosEscola.includes(project.envioEscola));

      const matchesUsuariosPrincipais =
        selectedFilters.usuariosPrincipais.length === 0 ||
        Boolean(
          project.usuarioPrincipal &&
          selectedFilters.usuariosPrincipais.includes(project.usuarioPrincipal)
        );

      const matchesVideoCategory =
        selectedFilters.videoCategory.length === 0 ||
        (project.videoCategory && selectedFilters.videoCategory.includes(project.videoCategory));

      const matchesSAMR =
        selectedFilters.samr.length === 0 ||
        (project.samr && selectedFilters.samr.includes(project.samr));

      const matchesVolumes =
        selectedFilters.volumes.length === 0 ||
        (project.volume && selectedFilters.volumes.includes(project.volume));

      const pAud = project as ODAFromExcel & { vestibular?: string; capitulo?: string };
      const matchesVestibular =
        selectedFilters.vestibular.length === 0 ||
        (project.contentType === 'Audiovisual' &&
          pAud.vestibular &&
          selectedFilters.vestibular.includes(pAud.vestibular));

      const matchesCapitulo =
        selectedFilters.capitulo.length === 0 ||
        (project.contentType === 'Audiovisual' &&
          pAud.capitulo &&
          selectedFilters.capitulo.includes(pAud.capitulo));

      return (
        matchesSearch &&
        matchesAnos &&
        matchesTags &&
        matchesBNCC &&
        matchesSegmentos &&
        matchesCategorias &&
        matchesMarcas &&
        matchesTipoObjeto &&
        matchesMacroformato &&
        matchesColecoes &&
        matchesLivros &&
        matchesBlocos &&
        matchesPalavrasChave &&
        matchesEnviosEscola &&
        matchesUsuariosPrincipais &&
        matchesVideoCategory &&
        matchesSAMR &&
        matchesVolumes &&
        matchesVestibular &&
        matchesCapitulo
      );
    });
  }, [contentTypeFilteredProjects, searchQuery, selectedFilters]);

  const handleFilterChange = useCallback((category: string, value: string) => {
    const key = category as keyof SelectedFilters;
    if (!(key in initialSelectedFilters)) return;
    setSelectedFilters((prev) => {
      const currentValues = prev[key];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [key]: newValues };
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedFilters(initialSelectedFilters);
  }, []);

  return {
    filterOptions,
    selectedFilters,
    handleFilterChange,
    handleClearFilters,
    filteredProjects,
    contentTypeFilteredProjects,
  };
}

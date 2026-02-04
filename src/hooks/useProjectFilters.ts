import { useState, useMemo, useCallback } from 'react';
import type { ODAFromExcel } from '../utils/importODAs';
import { getComponentFullName, getSegmentFullName, sortSegments, getMarcaFullName } from '../utils/curriculumColors';

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
};

export interface FilterOptions {
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
            .map((p) => p.bnccCode)
            .filter((code) => {
              if (!code) return false;
              const t = String(code).trim();
              return t !== '' && t !== 'undefined' && t !== 'null';
            })
            .map((code) => String(code).trim())
        )
      ).sort(),
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
            .filter((p) => p.contentType === 'OED' && 'tipoObjeto' in p)
            .map((p) => (p as ODAFromExcel).tipoObjeto)
            .filter(Boolean) as string[]
        )
      ).sort(),
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
        (project.category?.toLowerCase() || '').includes(q) ||
        (project.volume?.toLowerCase() || '').includes(q) ||
        (project.segmento?.toLowerCase() || '').includes(q) ||
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
        (project.bnccCode &&
          project.bnccCode.trim() !== '' &&
          selectedFilters.bnccCodes.some((c) => project.bnccCode?.trim() === c.trim()));

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
        (project.contentType === 'OED' &&
          (project as ODAFromExcel).tipoObjeto &&
          selectedFilters.tipoObjeto.includes((project as ODAFromExcel).tipoObjeto!));

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

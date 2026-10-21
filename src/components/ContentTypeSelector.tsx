import type { ComponentType } from 'react';
import { BookOpen, Gamepad2, Video } from 'lucide-react';

export type ContentTypeFilter = 'Todos' | 'Audiovisual' | 'OED';

const OPTIONS: { value: ContentTypeFilter; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { value: 'Todos', label: 'Todos', Icon: BookOpen },
  { value: 'Audiovisual', label: 'Audiovisual', Icon: Video },
  { value: 'OED', label: 'Objeto Digital', Icon: Gamepad2 },
];

export function ContentTypeSelector({
  value,
  onChange,
}: {
  value: ContentTypeFilter;
  onChange: (value: ContentTypeFilter) => void;
}) {
  return (
    <div id="acervo-content-type" className="mb-10">
      <h2 className="text-gray-700 font-semibold mb-4" style={{ fontSize: '16px' }}>
        Selecione o tipo de conteúdo
      </h2>
      <div className="flex items-center gap-3 flex-wrap">
        {OPTIONS.map(({ value: option, label, Icon }) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl transition-all duration-200 font-semibold border cursor-pointer ${
              value === option
                ? 'bg-secondary text-white border-secondary shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import { Video, Gamepad2, Headphones, Monitor, ListVideo, Presentation, Wrench, Box, Sparkles, MousePointer2 } from 'lucide-react';
import { resolveMacroformato, type MacroformatoKind } from '../utils/macroformato';

function MacroIcon({ kind, className }: { kind: MacroformatoKind; className?: string }) {
  const props = { className: className || 'w-3.5 h-3.5' };
  switch (kind) {
    case 'video':
      return <Video {...props} />;
    case 'audio':
      return <Headphones {...props} />;
    case 'interactive':
      return <MousePointer2 {...props} />;
    case 'sim':
      return <Box {...props} />;
    case 'playlist':
      return <ListVideo {...props} />;
    case 'ra':
      return <Sparkles {...props} />;
    case 'slide':
      return <Presentation {...props} />;
    case 'tool':
      return <Wrench {...props} />;
    case 'support':
      return <Monitor {...props} />;
    default:
      return <Gamepad2 {...props} />;
  }
}

export function MacroformatoBadge({
  value,
  className = '',
}: {
  value?: string | null;
  className?: string;
}) {
  const macro = resolveMacroformato(value);
  if (!macro) return null;
  return (
    <div className={`${macro.className} ${className}`.trim()} title="Macroformato">
      <MacroIcon kind={macro.kind} className="w-3.5 h-3.5" />
      <span>{macro.label}</span>
    </div>
  );
}

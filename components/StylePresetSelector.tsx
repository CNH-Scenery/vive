import React, { useMemo, useState } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { HairStylePreset } from '../types';

interface StylePresetSelectorProps {
  presets: HairStylePreset[];
  selectedPreset: HairStylePreset | null;
  onSelect: (preset: HairStylePreset) => void;
  currentLength?: 'short' | 'medium' | 'long' | 'extra_long' | 'unclear';
}

const FILTERS = [
  '전체',
  '숏',
  '미디엄',
  '롱',
  '남성',
  '여성',
  '펌/웨이브',
  '컬러',
] as const;

const LENGTH_LABELS: Record<string, string> = {
  short: '숏',
  medium: '미디엄',
  long: '롱',
  extra_long: '롱',
  style: '스타일',
};

const TEXTURE_LABELS: Record<string, string> = {
  straight: '스트레이트',
  soft_wave: '소프트 웨이브',
  strong_wave: '웨이브',
  curl: '컬',
  frizzy: '텍스처',
  wet: '웻',
  other: '스타일',
  unclear: '스타일',
};

const matchesFilter = (preset: HairStylePreset, filter: string) => {
  if (filter === '전체') {
    return true;
  }

  if (filter === '남성') {
    return preset.category === 'men' || preset.tags.includes('남성');
  }

  if (filter === '여성') {
    return preset.category === 'women' || preset.tags.includes('여성');
  }

  return preset.tags.includes(filter);
};

const getPresetMeta = (preset: HairStylePreset) => {
  const hairSpec = preset.hairSpec as {
    overall?: { lengthLabel?: string };
    texture?: { baseTexture?: string };
  };

  const lengthLabel = hairSpec.overall?.lengthLabel || 'style';
  const texture = hairSpec.texture?.baseTexture || 'other';

  return {
    lengthLabel,
    lengthText: LENGTH_LABELS[lengthLabel] || lengthLabel,
    textureText: TEXTURE_LABELS[texture] || texture,
  };
};

const needsLengthConsultation = (
  presetLength: string,
  currentLength?: 'short' | 'medium' | 'long' | 'extra_long' | 'unclear',
) => {
  if (!currentLength || currentLength === 'unclear') {
    return false;
  }

  const lengthValues = {
    short: 1,
    medium: 2,
    long: 3,
    extra_long: 4,
    style: 0,
  };

  const currentValue = lengthValues[currentLength] || 0;
  const targetValue = lengthValues[presetLength as keyof typeof lengthValues] || 0;

  return targetValue > currentValue && targetValue > 0 && currentValue > 0;
};

const StylePresetSelector: React.FC<StylePresetSelectorProps> = ({
  presets,
  selectedPreset,
  onSelect,
  currentLength,
}) => {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('전체');

  const filteredPresets = useMemo(
    () => presets.filter((preset) => matchesFilter(preset, activeFilter)),
    [activeFilter, presets],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]'
                  : 'border-zinc-800 bg-zinc-900 text-gray-400 hover:border-[#D4AF37]/50 hover:text-gray-200'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filteredPresets.map((preset) => {
          const isSelected = selectedPreset?.id === preset.id;
          const visibleTags = preset.tags.slice(1, 4);
          const meta = getPresetMeta(preset);
          const needsConsultation = needsLengthConsultation(meta.lengthLabel, currentLength);

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              aria-pressed={isSelected}
              className={`group flex h-full flex-col overflow-hidden rounded-lg border bg-zinc-900 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-zinc-600 ${
                isSelected ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]' : 'border-zinc-800'
              }`}
            >
              <div className="relative aspect-[4/5] w-full shrink-0 bg-zinc-800">
                <img
                  src={preset.thumbnail}
                  alt={preset.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {needsConsultation && (
                  <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-medium text-amber-200">
                    <AlertCircle className="h-3 w-3" />
                    상담 필요
                  </div>
                )}
                {isSelected && (
                  <div className="absolute right-2 top-2 rounded-full bg-[#D4AF37] p-1.5 text-black shadow-md">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col space-y-2 p-3 text-gray-200">
                <div>
                  <h4 className="line-clamp-2 text-sm font-semibold leading-snug">
                    {preset.name}
                  </h4>
                  <p className="mt-1 text-[10px] text-gray-400">
                    {meta.lengthText} · {meta.textureText}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {visibleTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StylePresetSelector;

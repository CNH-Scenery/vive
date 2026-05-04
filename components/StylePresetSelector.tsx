import React, { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
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

  return {
    lengthLabel: hairSpec.overall?.lengthLabel || 'style',
    texture: hairSpec.texture?.baseTexture || 'texture',
  };
};

const isPresetDisabled = (
  presetLength: string,
  currentLength?: 'short' | 'medium' | 'long' | 'extra_long' | 'unclear'
) => {
  if (!currentLength || currentLength === 'unclear') return false;
  
  const lengthValues = {
    short: 1,
    medium: 2,
    long: 3,
    extra_long: 4,
    style: 0,
  };

  const currentVal = lengthValues[currentLength as keyof typeof lengthValues] || 0;
  const targetVal = lengthValues[presetLength as keyof typeof lengthValues] || 0;

  // You cannot choose a style that is longer than your current hair
  return targetVal > currentVal && targetVal > 0 && currentVal > 0;
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
          const disabled = isPresetDisabled(meta.lengthLabel, currentLength);

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => !disabled && onSelect(preset)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={`group flex flex-col h-full overflow-hidden rounded-lg border text-left shadow-sm transition-all ${
                disabled
                  ? 'border-zinc-800 bg-zinc-900 opacity-40 grayscale cursor-not-allowed'
                  : isSelected
                  ? 'border-[#D4AF37] ring-1 ring-[#D4AF37] bg-zinc-800'
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
              }`}
            >
              <div className="relative w-full shrink-0 aspect-[4/5] bg-zinc-800">
                <img
                  src={preset.thumbnail}
                  alt={preset.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {disabled && (
                  <div className="absolute inset-0 bg-black/40" />
                )}
                {isSelected && !disabled && (
                  <div className="absolute right-2 top-2 rounded-full bg-[#D4AF37] p-1.5 text-black shadow-md">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className={`flex flex-col flex-1 space-y-2 p-3 ${disabled ? 'text-gray-500' : 'text-gray-200'}`}>
                <div>
                  <h4 className="line-clamp-2 text-sm font-semibold leading-snug">
                    {preset.name}
                  </h4>
                  <p className="mt-1 text-[10px] text-gray-400">
                    {meta.lengthLabel} · {meta.texture}
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

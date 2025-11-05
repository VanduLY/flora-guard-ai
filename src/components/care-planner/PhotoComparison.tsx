import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ArrowLeftRight } from "lucide-react";

interface Milestone {
  id: string;
  plant_id: string;
  milestone_type: string;
  title: string;
  photo_url?: string;
  created_at: string;
  measurement_value?: number;
  measurement_unit?: string;
}

interface PhotoComparisonProps {
  milestones: Milestone[];
  onCompare?: (m1: Milestone, m2: Milestone) => void;
}

const PhotoComparison = ({ milestones, onCompare }: PhotoComparisonProps) => {
  const [beforeId, setBeforeId] = useState(milestones[milestones.length - 1]?.id);
  const [afterId, setAfterId] = useState(milestones[0]?.id);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const beforeMilestone = milestones.find((m) => m.id === beforeId);
  const afterMilestone = milestones.find((m) => m.id === afterId);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  if (!beforeMilestone || !afterMilestone) return null;

  return (
    <div className="space-y-4">
      {/* Selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Before</label>
          <Select value={beforeId} onValueChange={setBeforeId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {milestones.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {format(new Date(m.created_at), "MMM d, yyyy")} - {m.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">After</label>
          <Select value={afterId} onValueChange={setAfterId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {milestones.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {format(new Date(m.created_at), "MMM d, yyyy")} - {m.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comparison Slider */}
      <div
        className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-ew-resize select-none"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onTouchMove={handleTouchMove}
      >
        {/* After Image (Full) */}
        <img
          src={afterMilestone.photo_url}
          alt="After"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={beforeMilestone.photo_url}
            alt="Before"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5 text-gray-700" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm">
          Before
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded text-sm">
          After
        </div>
      </div>

      {/* Comparison Stats */}
      {beforeMilestone.measurement_value && afterMilestone.measurement_value && (
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Before</div>
            <div className="text-lg font-semibold">
              {beforeMilestone.measurement_value} {beforeMilestone.measurement_unit}
            </div>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            <div className="text-sm text-muted-foreground">Growth</div>
            <div className="text-lg font-semibold text-primary">
              +
              {(
                afterMilestone.measurement_value - beforeMilestone.measurement_value
              ).toFixed(1)}{" "}
              {afterMilestone.measurement_unit}
            </div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">After</div>
            <div className="text-lg font-semibold">
              {afterMilestone.measurement_value} {afterMilestone.measurement_unit}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoComparison;
